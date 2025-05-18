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
from models import db, Project, Classroom, Admin

# Load environment variables
load_dotenv(find_dotenv())
# Initialize Flask app
app = Flask(__name__)

# get the database URL from the environment variable
if os.getenv("CLOUD_SQL", "false").lower() == "true":
    db_uri = (
        # TODO: replace with the actual connection string for google cloud sql
    )
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
        project = db.session.query(Project).get_or_404(project_id)
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
    if not Project.query.get(project_id):
        return jsonify({'error': 'Project not found'}), 404

    try:
        project = db.session.query(Project).get_or_404(project_id)
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
        project = Project.query.get_or_404(project_id)
        db.session.delete(project)
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
