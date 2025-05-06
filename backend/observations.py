import os
import requests
import json
import pymysql
import logging
from datetime import datetime
from requests.exceptions import RequestException
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from models import db, Observation

# Load environment variables
load_dotenv('./.env')
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
@app.route('/observations', methods=['GET'])
def get_observations():
    """
    Get all observations from the database
    """
    try:
        observations = Observation.query.all()
        return jsonify([observation.to_dict() for observation in observations]), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/observations/<int:observation_id>', methods=['GET'])
def get_observation(observation_id):
    """
    Get a specific observation by ID
    """
    # Check if the observation exists
    if not Observation.query.get(observation_id):
        return jsonify({'error': 'Observation not found'}), 404
    try:
        observation = Observation.query.get_or_404(observation_id)
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
    if 'student_id' not in data or 'project_id' not in data or 'observation_text' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    if not isinstance(data['student_id'], int) or not isinstance(data['project_id'], int):
        return jsonify({'error': 'student_id and project_id must be integers'}), 400
    if 'observation_text' in data and not isinstance(data['observation_text'], dict):
        return jsonify({'error': 'observation_text must be a JSON object (i.e., a dictionary) if provided'}), 400

    try:
        new_observation = Observation(
            student_id=data['student_id'],
            project_id=data['project_id'],
            observation_text=data['observation_text']
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
    if 'student_id' not in data or 'project_id' not in data or 'observation_text' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    if not isinstance(data['student_id'], int) or not isinstance(data['project_id'], int):
        return jsonify({'error': 'student_id and project_id must be integers'}), 400
    if 'observation_text' in data and not isinstance(data['observation_text'], dict):
        return jsonify({'error': 'observation_text must be a JSON object (i.e., a dictionary) if provided'}), 400

    # Check if the observation exists
    observation = Observation.query.get(observation_id)
    if not observation:
        return jsonify({'error': 'Observation not found'}), 404

    try:
        observation.student_id = data['student_id']
        observation.project_id = data['project_id']
        observation.observation_text = data['observation_text']
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
    observation = Observation.query.get(observation_id)
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
