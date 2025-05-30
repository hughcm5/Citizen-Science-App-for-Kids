import os
import requests
import json
import pymysql
import logging
from datetime import datetime
from requests.exceptions import RequestException
from dotenv import load_dotenv, find_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from models import db, Observation, Student, Project
from google.cloud.sql.connector import Connector

# Load environment variables
load_dotenv(find_dotenv())
# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:8081"}})
CORS(app, supports_credentials=True)


def getconn():
    conn = connector.connect(
        os.environ["DB_CONNECTION_NAME"],
        "pymysql",
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        db=os.environ["DB_NAME"],
    )
    return conn


# Initialize the Cloud SQL Python Connector
connector = Connector()

# Get the database URL from the environment variable
if os.getenv("CLOUD_SQL", "false").lower() == "true":
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
@app.route('/observations', methods=['GET'])
def get_observations():
    """
    Get all observations from the database
    """
    try:
        observations = db.session.query(Observation).all()
        return jsonify([observation.to_dict() for observation in observations]), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/observations/<int:observation_id>', methods=['GET'])
def get_observation(observation_id):
    """
    Get a specific observation by ID
    """
    # Check if the observation exists
    if not db.session.query(Observation).filter_by(observation_id=observation_id).one_or_none():
        return jsonify({'error': 'Observation not found'}), 404
    try:
        observation = db.session.query(Observation).filter_by(observation_id=observation_id).one_or_none()
        return jsonify(observation.to_dict()), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/observations', methods=['POST'])
def create_observation():
    """
    Create a new observation
    """
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400
    if 'student_id' not in data or 'project_id' not in data or 'observation_data' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    if not isinstance(data['student_id'], int) or not isinstance(data['project_id'], int):
        return jsonify({'error': 'student_id and project_id must be integers'}), 400
    if 'observation_data' in data and not isinstance(data['observation_data'], dict):
        return jsonify({'error': 'observation_data must be a JSON object (i.e., a dictionary) if provided'}), 400

    # verify if the student_id and project_id exist in the database
    student = db.session.query(Student).filter_by(student_id=data['student_id']).one_or_none()
    project = db.session.query(Project).filter_by(project_id=data['project_id']).one_or_none()
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    try:
        new_observation = Observation(
            student_id=data['student_id'],
            project_id=data['project_id'],
            observation_data=data['observation_data']
        )
        db.session.add(new_observation)
        db.session.commit()
        return jsonify(new_observation.to_dict()), 201
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/observations/<int:observation_id>', methods=['PUT'])
def update_observation(observation_id):
    """
    Update an existing observation
    """
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    if 'student_id' not in data or 'project_id' not in data or 'observation_data' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    if not isinstance(data['student_id'], int) or not isinstance(data['project_id'], int):
        return jsonify({'error': 'student_id and project_id must be integers'}), 400
    if 'observation_data' in data and not isinstance(data['observation_data'], dict):
        return jsonify({'error': 'observation_data must be a JSON object (i.e., a dictionary) if provided'}), 400

    # Check if the observation exists
    observation = db.session.query(Observation).filter_by(observation_id=observation_id).one_or_none()
    if not observation:
        return jsonify({'error': 'Observation not found'}), 404

    # verify if the student_id and project_id exist in the database
    student = db.session.query(Student).filter_by(student_id=data['student_id']).one_or_none()
    project = db.session.query(Project).filter_by(project_id=data['project_id']).one_or_none()
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    try:
        observation.student_id = data['student_id']
        observation.project_id = data['project_id']
        observation.observation_data = data['observation_data']
        db.session.commit()
        return jsonify(observation.to_dict()), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/observations/<int:observation_id>', methods=['DELETE'])
def delete_observation(observation_id):
    """
    Delete an observation by ID
    """
    # Check if the observation exists
    observation = db.session.query(Observation).filter_by(observation_id=observation_id).one_or_none()
    if not observation:
        return jsonify({'error': 'Observation not found'}), 404

    try:
        db.session.delete(observation)
        db.session.commit()
        return '', 204
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    Also checks if the database is reachable
    """
    try:
        return jsonify({'status': 'healthy'}), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.getenv('OBSERVATIONS_PORT', 5002))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
