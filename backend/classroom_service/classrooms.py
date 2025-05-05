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
from models import db, Classroom

# Load environment variables
load_dotenv('../.env')
# Initialize Flask app
app = Flask(__name__)
# CORS configuration
CORS(app,
     origins=os.getenv('CORS_ORIGINS', 'http://localhost:3006').split(','),
     supports_credentials=True
     )

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
@app.route('/classrooms', methods=['GET'])
def get_classrooms():
    """
    Get all classrooms from the database
    """
    try:
        classrooms = Classroom.query.all()
        return jsonify([classroom.to_dict() for classroom in classrooms]), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/classrooms/<int:class_id>', methods=['GET'])
def get_classroom(class_id):
    """
    Get a specific classroom by ID
    """
    # Check if the classroom exists
    if not Classroom.query.get(class_id):
        return jsonify({'error': 'Classroom not found'}), 404
    try:
        classroom = Classroom.query.get_or_404(class_id)
        return jsonify(classroom.to_dict()), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/classrooms', methods=['POST'])
def create_classroom():
    """
    Create a new classroom
    """
    data = request.get_json()

    # Validate the input data
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    if 'class_code' not in data or 'admin_id' not in data:
        return jsonify({'error': 'Missing required fields'}), 400   
    if not isinstance(data['class_code'], str) or not isinstance(data['admin_id'], int):
        return jsonify({'error': 'class_code must be a string and admin_id must be an integer'}), 400
    if Classroom.query.filter_by(class_code=data['class_code']).first():
        return jsonify({'error': 'Class code already exists'}), 400
    if data['class_name'] and (len(data['class_name']) > 255 or not isinstance(data['class_name'], str)):
        return jsonify({'error': 'class_name must be a string and less than 255 characters'}), 400
    if data['grade_level'] and (len(data['grade_level']) > 50 or not isinstance(data['grade_level'], str)):
        return jsonify({'error': 'grade_level must be a string and less than 50 characters'}), 400

    # check if the admin exists
    # Uncomment this line once the Admin model is implemented ###########################################################
    # if not Admin.query.get(data['admin_id']): 
    #     return jsonify({'error': 'Admin/Teacher not found'}), 404

    try:
        classroom = Classroom(
            class_code=data['class_code'],
            admin_id=data['admin_id'],
            class_name=data.get('class_name', ''),
            grade_level=data.get('grade_level', ''),
        )
        db.session.add(classroom)
        db.session.commit()
        return jsonify(classroom.to_dict()), 201
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/classrooms/<int:class_id>', methods=['PUT'])
def update_classroom(class_id):
    """
    Update a classroom
    """
    data = request.get_json()

    # Validate the input data
    if not data:
        return jsonify({'error': 'No input data provided'}), 400
    if 'class_code' not in data or 'admin_id' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    if not isinstance(data['class_code'], str) or not isinstance(data['admin_id'], int):
        return jsonify({'error': 'class_code must be a string and admin_id must be an integer'}), 400
    if len(data['class_code']) > 20:
        return jsonify({'error': 'class_code must be less than 20 characters'}), 400
    if data['class_name'] and (len(data['class_name']) > 255 or not isinstance(data['class_name'], str)):
        return jsonify({'error': 'class_name must be a string and less than 255 characters'}), 400
    if data['grade_level'] and (len(data['grade_level']) > 50 or not isinstance(data['grade_level'], str)):
        return jsonify({'error': 'grade_level must be a string and less than 50 characters'}), 400

    # check if the admin exists
    # Uncomment this line once the Admin model is implemented ###########################################################
    # if not Admin.query.get(data['admin_id']): 
    #     return jsonify({'error': 'Admin/Teacher not found'}), 404

    # Check if the classroom exists
    classroom = Classroom.query.get(class_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    try:
        classroom.class_code = data['class_code']
        classroom.admin_id = data['admin_id']
        classroom.class_name = data.get('class_name', '')
        classroom.grade_level = data.get('grade_level', '')
        db.session.commit()
        return jsonify(classroom.to_dict()), 200
    except RequestException as e:
        return jsonify({'error': repr(e)}), 500


@app.route('/classrooms/<int:class_id>', methods=['DELETE'])
def delete_classroom(class_id):
    """
    Delete a classroom
    """
    # Check if the classroom exists
    classroom = Classroom.query.get(class_id)
    if not classroom:
        return jsonify({'error': 'Classroom not found'}), 404

    try:
        db.session.delete(classroom)
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
    port = int(os.getenv('CLASSROOMS_PORT', 5006))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
