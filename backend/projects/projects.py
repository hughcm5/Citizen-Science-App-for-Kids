import os
import requests
import json
import pymysql
import logging
import csv
from datetime import datetime
from requests.exceptions import RequestException
from dotenv import load_dotenv, find_dotenv
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from models import db, Project, Student, Classroom, Admin
from collections import defaultdict, Counter
from google.cloud.sql.connector import Connector
from google.cloud import secretmanager
from flask_cors import CORS


# Load environment variables
load_dotenv(find_dotenv())

# Initialize Flask app
app = Flask(__name__)

def access_secret_version(project_id, secret_id, version_id="latest"):
    try:
        client = secretmanager.SecretManagerServiceClient()
        name = f"projects/{project_id}/secrets/{secret_id}/versions/{version_id}"
        response = client.access_secret_version(name=name)
        payload = response.payload.data.decode("UTF-8")
        return payload
    except Exception as e:
        app.logger.error(f"Error accessing secret: {secret_id} in project: {project_id}. Error: {e}")
        if os.environ.get('GAE_ENV') == 'standard':
            raise
        return None


# Get the database URL from the environment variable
if os.getenv("CLOUD_SQL", "false").lower() == "true":
    # NOT using the Cloud SQL Proxy or local development grab secrets from Secret Manager
    PROJECT_ID = os.environ.get("GOOGLE_CLOUD_PROJECT")
    DB_USER = access_secret_version(PROJECT_ID, "DB_USER")
    DB_PASSWORD = access_secret_version(PROJECT_ID, "DB_PASSWORD")
    CLIENT_ID = access_secret_version(PROJECT_ID, "CLIENT_ID")
    CLIENT_SECRET = access_secret_version(PROJECT_ID, "CLIENT_SECRET")
    GOOGLE_CLIENT_SECRET = access_secret_version(PROJECT_ID, "GOOGLE_CLIENT_SECRET")


def getconn():
    conn = connector.connect(
        os.environ["DB_CONNECTION_NAME"],
        "pymysql",
        user=DB_USER,
        password=DB_PASSWORD,
        db=os.environ["DB_NAME"],
    )
    return conn


# Get the database URL from the environment variable
if os.getenv("CLOUD_SQL", "false").lower() == "true":

    # Initialize the Cloud SQL Python Connector
    connector = Connector()

    # used the documentation for this and the function it uses https://pypi.org/project/cloud-sql-python-connector/
    app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://"
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "creator": getconn
        }

else:
    db_uri = (
        f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST', 'localhost')}:{os.getenv('DB_PORT', '3306')}/{os.getenv('DB_NAME')}"
    )

    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)


# Routes
@app.route('/projects', methods=['GET'])
def get_projects():
    """
    Get all projects from the database
    """
    try:
        projects = db.session.query(Project).all()
        return jsonify([project.to_dict() for project in projects]), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/projects/<int:project_id>', methods=['GET'])
def get_project(project_id):
    """
    Get a specific project by ID
    """
    # Check if the project exists
    if not db.session.get(Project, project_id):
        return jsonify({'error': 'Project not found'}), 404

    try:
        project = db.session.get(Project, project_id)
        return jsonify(project.to_dict()), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/projects', methods=['POST'])
def create_project():
    """
    Create a new project
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    # Validate the input data
    required_fields = ['class_id', 'project_title', 'description']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # Validate the class_id
    if not db.session.get(Classroom, data['class_id']):
        return jsonify({'error': 'Classroom not found'}), 404

    try:
        new_project = Project(
            class_id=data['class_id'],
            project_title=data['project_title'],
            description=data.get('description', ''),
            project_settings=data.get('project_settings', {}),
        )
        db.session.add(new_project)
        db.session.commit()
        return jsonify(new_project.to_dict()), 201
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """
    Update an existing project
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    # Validate the input data
    required_fields = ['class_id', 'project_title', 'description']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # Validate the class_id
    if not db.session.get(Classroom, data['class_id']):
        return jsonify({'error': 'Classroom not found'}), 404

    # Check if the project exists
    if not db.session.get(Project, project_id):
        return jsonify({'error': 'Project not found'}), 404
    project = db.session.get(Project, project_id)

    try:
        project.class_id = data['class_id']
        project.project_title = data['project_title']
        project.description = data.get('description', '')
        project.project_settings = data.get('project_settings', {})
        db.session.commit()
        return jsonify(project.to_dict()), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """
    Delete a project by ID
    """
    # Check if the project exists
    if not db.session.get(Project, project_id):
        return jsonify({'error': 'Project not found'}), 404

    try:
        project = db.session.get(Project, project_id)
        db.session.delete(project)
        db.session.commit()
        return '', 204

    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


# CSV endpoint
@app.route('/projects/<int:project_id>/csv', methods=['GET'])
def get_project_csv(project_id):
    """
    Get CSV file containing all observations for a specific project
    """
    try:
        project = db.session.get(Project, project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404

        obs_dict = [obs.to_dict() for obs in project.observations]

        headers = [
            'observation_id', 'project_id', 'project title', 'student_id',
            'student firstname', 'student lastname', 'class id',
            'created_at', 'updated_at', 'Observation data'
        ]
        csv_data = ','.join(headers) + '\n'

        for ob_data in obs_dict:
            row = [
                # if header is not 'Observation data', convert to string
                str(ob_data.get(h, '')) if h != 'Observation data' else
                json.dumps(ob_data.get(h, {}))
                for h in headers
            ]
            csv_data += ','.join(row) + '\n'

        return csv_data, 200, {'Content-Type': 'text/csv',
                               'Content-Disposition': f'attachment; filename=project_{project_id}_observations.csv'}

    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/projects/<int:project_id>/csv_download', methods=['GET'])
def download_project_csv(project_id):
    try:
        project = db.session.get(Project, project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404

        obs_dict = [obs.to_dict() for obs in project.observations]

        headers = [
            'observation_id', 'project_id', 'project title', 'student_id',
            'student firstname', 'student lastname', 'class id',
            'created_at', 'updated_at', 'Observation data'
        ]
        csv_data = ','.join(headers) + '\n'
        file_name = f'project_{project_id}_observations.csv'
        # Iterate through the observations and make the obervation data a string
        for ob_data in obs_dict:
            row = [
                # if header is not 'Observation data', convert to string
                str(ob_data.get(h, '')) if h != 'Observation data' else
                json.dumps(ob_data.get(h, {}))
                for h in headers
            ]
            csv_data += ','.join(row) + '\n'

        with open(file_name, 'w') as csv_file:
            csv_file.write(csv_data)
        return send_file(file_name, as_attachment=True, download_name=file_name,
                         mimetype='text/csv')

    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/projects/<int:project_id>/results', methods=['GET'])
def get_project_results(project_id):
    """
    Get results for a specific project
    """
    # Check if the project exists
    try:
        project = db.session.get(Project, project_id)
        if not project:
            return jsonify({'error': 'Project not found'}), 404

        obs_dict = [obs.to_dict() for obs in project.observations]

        # get all students in the class
        students = db.session.query(Student).filter_by(class_id=project.class_id).all()
        student_with_observations = []
        student_no_observations = []
        for student in students:
            # check if the student has any observations
            if any(obs['student_id'] == student.student_id for obs in obs_dict):
                student_with_observations.append({
                    'student_id': student.student_id,
                    'first_name': student.student_firstname,
                    'last_name': student.student_lastname
                })
            else:
                student_no_observations.append({
                    'student_id': student.student_id,
                    'first_name': student.student_firstname,
                    'last_name': student.student_lastname
                })

        # Collect all keys from observation_data
        numeric_sums = defaultdict(float)
        numeric_counts = defaultdict(int)
        categorical_counts = defaultdict(Counter)
   
        for obs in obs_dict:
            obs_data = obs.get("Observation data", {})
            for key, value in obs_data.items():
                if isinstance(value, (int, float)):
                    numeric_sums[key] += value
                    numeric_counts[key] += 1
                elif isinstance(value, str) or isinstance(value, bool):
                    categorical_counts[key][str(value)] += 1

        # Prepare stats summary
        field_data_stats = {}

        # Calculate average, min, max for numeric fields
        for key in numeric_sums:
            if numeric_counts[key] > 0:
                field_data_stats[key] = {
                    type: 'numeric',
                    'average': numeric_sums[key] / numeric_counts[key],
                    'min': min(obs_data[key] for obs_data in obs_dict if key in obs_data),
                    'max': max(obs_data[key] for obs_data in obs_dict if key in obs_data),
                    'sum': numeric_sums[key],
                    'count': numeric_counts[key]
                }

        # Frequency counts for categorical fields
        for key, counter in categorical_counts.items():
            field_data_stats[key] = {
                'type': 'categorical',
                "frequencies": dict(counter),
                "count": sum(counter.values()),
                "most_common": counter.most_common(1)[0] if counter else None,
                "least_common": counter.most_common()[-1] if len(counter) > 1 else None,
                "unique_values": len(counter)
                }

        results = {
            'project': {
                'project_id': project.project_id,
                'project_title': project.project_title,
                'description': project.description,
                'class_id': project.class_id
            },
            'observations': obs_dict,
            'stats': {
                'total_observations': len(obs_dict),
                'total_students': len(students),
                'students_with_observations': len(student_with_observations),
                'students_without_observations': len(student_no_observations),
                'completion_percentage': len(student_with_observations) / len(students) * 100 if students else 0,
                'average_observations_per_student': len(obs_dict) / len(students) if students else 0,
                'average_observations_per_student_with_observations': len(obs_dict) / len(student_with_observations) if student_with_observations else 0,
            },
            'students_with_observations': student_with_observations,
            'students_without_observations': student_no_observations,
            'field_data_stats': field_data_stats
        }

        return jsonify(results)

    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    Also checks if the database is reachable
    """
    try:
        # # Check if the database is reachable
        # db.session.execute('SELECT 1')
        return jsonify({'status': 'healthy'}), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    port = int(os.getenv('PROJECTS_PORT', 5001))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'  # Set to True for debugging, False for production
    app.run(host='0.0.0.0', port=port, debug=debug)
