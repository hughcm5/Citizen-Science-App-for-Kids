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
from models import db, Classroom, Student, Observation
from google.cloud.sql.connector import Connector
from google.cloud import secretmanager


# Load environment variables
load_dotenv(find_dotenv())

# Initialize Flask app
app = Flask(__name__)
app.secret_key = 'SECRET_KEY'


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
@app.route('/students', methods=['GET'])
def get_students():
    """
    Get all students from the database
    Will later be used to get all students if the user is a admin 
    or if a teacher only the students in thier classes
    """
    try:
        students = db.session.query(Student).all()
        if not students:
            return jsonify({'error': 'No students found'}), 404
        return jsonify([student.to_dict() for student in students]), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/students/<int:student_id>', methods=['GET'])
def get_student(student_id):
    """
    Get a specific student by ID
    """
    # Check if the student exists
    student = db.session.query(Student).filter_by(student_id=student_id).one_or_none()
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    try:
        return jsonify(student.to_dict()), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/students', methods=['POST'])
def create_student():
    """
    Create a new student
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400
        if 'student_lastname' not in data or 'student_firstname' not in data or 'class_id' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        if not isinstance(data['student_lastname'], str) or not isinstance(data['student_firstname'], str):
            return jsonify({'error': 'student_lastname and student_firstname must be strings'}), 400
        if not isinstance(data['class_id'], int):
            return jsonify({'error': 'class_id must be integers'}), 400
        # if not isinstance(data['class_codes'], list):
        #     return jsonify({'error': 'class_codes must be a list'}), 400
        new_student = Student(
            student_lastname=data['student_lastname'],
            student_firstname=data['student_firstname'],
            class_id=data.get('class_id'),
            # student_id=data['student_id'],
            # class_codes=data.get('class_codes', []),
        )
        db.session.add(new_student)
        db.session.commit()
        return jsonify(new_student.to_dict()), 201
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/students/<int:student_id>', methods=['PUT'])
def update_student(student_id):
    """
    Update a student by ID
    """
    # Check if the student exists
    if not db.session.query(Student).filter_by(student_id=student_id).one_or_none():
        return jsonify({'error': 'Student not found'}), 404
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No data provided'}), 400
        if 'student_lastname' not in data or 'student_firstname' not in data or 'class_id' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
        if not isinstance(data['student_lastname'], str) or not isinstance(data['student_firstname'], str):
            return jsonify({'error': 'student_lastname and student_firstname must be strings'}), 400
        if not isinstance(data['class_id'], int):
            return jsonify({'error': 'class_id must be integers'}), 400
        # if not isinstance(data['class_codes'], list):
        #     return jsonify({'error': 'class_codes must be a list'}), 400

        student = db.session.query(Student).filter_by(student_id=student_id).one_or_none()

        student.student_lastname = data.get('student_lastname', student.student_lastname)
        student.student_firstname = data.get('student_firstname', student.student_firstname)
        student.class_id = data.get('class_id', student.class_id)
        # student.student_id = data.get('student_id', student.student_id)
        # student.class_codes = data.get('class_codes', student.class_codes)
        db.session.commit()
        return jsonify(student.to_dict()), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/students/<int:student_id>', methods=['DELETE'])
def delete_student(student_id):
    """
    Delete a student by ID
    """
    # Check if the student exists
    if not db.session.query(Student).filter_by(student_id=student_id).one_or_none():
        return jsonify({'error': 'Student not found'}), 404
    try:
        student = db.session.query(Student).filter_by(student_id=student_id).one_or_none()
        db.session.delete(student)
        db.session.commit()
        return jsonify({'message': 'Student deleted successfully'}), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/students/<int:student_id>/observations', methods=['GET'])
def get_student_observations(student_id):
    """
    Get all observations for a specific student
    """
    # Check if the student exists
    if not db.session.query(Student).filter_by(student_id=student_id).one_or_none():
        return jsonify({'error': 'Student not found'}), 404
    try:
        student = db.session.query(Student).filter_by(student_id=student_id).one_or_none()
        stu_data = student.to_dict()
        stu_obs = filter(lambda x: x['0'] in {'obervations'}, stu_data.items())
        return jsonify(stu_obs), 200
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
    port = int(os.getenv('CLASSROOMS_PORT', 5003))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
