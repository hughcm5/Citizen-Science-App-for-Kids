import os
import requests
import json
import pymysql
import logging
from datetime import datetime
from requests.exceptions import RequestException
from dotenv import load_dotenv, find_dotenv
from flask import Flask, request, jsonify, redirect, url_for, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from models import db, Admin
import uuid

# Load environment variables
load_dotenv(find_dotenv())

# Initialize Flask app
app = Flask(__name__)

# Get the database URL from the environment variable
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
app.secret_key = str(uuid.uuid4())  # For session management

# Initialize db with app
db.init_app(app)

# OAuth Settings
CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
SCOPE = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
REDIRECT_URI = 'http://localhost:5000/oauth/callback'
AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
PEOPLE_API_URL = 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses'


# Routes
@app.route('/admins', methods=['GET'])
def get_admins():
    try:
        admins = Admin.query.all()
        admin_list = [admin.to_dict() for admin in admins]
        return jsonify(admin_list), 200
    except RequestException as e:
        return jsonify({"error": "Failed to retrieve admins", "details": str(e)}), 500


@app.route('/admins', methods=['POST'])
def create_admin():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        if not data['email'] or not data['admin_firstname'] or not data['admin_lastname']:
            return jsonify({"error": "Missing required fields"}), 400

        # Check for existing admin
        if db.session.query(Admin).filter_by(email=data['email']).one_or_none():
            return jsonify({"error": "Admin with this email already exists"}), 409

        # validate the input data
        if 'admin_firstname' in data and (len(data['admin_firstname']) > 100 or not isinstance(data['admin_firstname'], str)):
            return jsonify({"error": "admin_firstname must be a string and less than 100 characters"}), 400
        if 'admin_lastname' in data and (len(data['admin_lastname']) > 100 or not isinstance(data['admin_lastname'], str)):
            return jsonify({"error": "admin_lastname must be a string and less than 100 characters"}), 400
        if 'email' in data and (len(data['email']) > 100 or not isinstance(data['email'], str)):
            return jsonify({"error": "email must be a string and less than 100 characters"}), 400
        if 'role' in data and (len(data['role']) > 50 or not isinstance(data['role'], str)):
            return jsonify({"error": "role must be a string and less than 50 characters"}), 400

        new_admin = Admin(
            admin_firstname=data.get('admin_firstname'),
            admin_lastname=data.get('admin_lastname'),
            email=data.get('email'),
            oauth_id=data.get('oauth_id'),
            role=data.get('role', 'teacher')
        )

        db.session.add(new_admin)
        db.session.commit()

        return jsonify(new_admin.to_dict()), 201

    except Exception as e:
        # Log the error for debugging
        app.logger.error(f"Error creating admin: {e}")
        return jsonify({"error": "An error occurred while creating the admin", "details": str(e)}), 500


@app.route('/admins/<int:id>', methods=['PUT'])
def update_admin(id):
    """
    Update an admin's details by their ID.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    # Find the admin by ID
    admin = db.session.query(Admin).filter_by(id=id).one_or_none()
    # If the admin doesn't exist, return an error
    if not admin:
        return jsonify({"error": "Admin not found"}), 404

    # validate the input data
    if 'admin_firstname' in data and (len(data['admin_firstname']) > 100 or not isinstance(data['admin_firstname'], str)):
        return jsonify({"error": "admin_firstname must be a string and less than 100 characters"}), 400
    if 'admin_lastname' in data and (len(data['admin_lastname']) > 100 or not isinstance(data['admin_lastname'], str)):
        return jsonify({"error": "admin_lastname must be a string and less than 100 characters"}), 400
    if 'email' in data and (len(data['email']) > 100 or not isinstance(data['email'], str)):
        return jsonify({"error": "email must be a string and less than 100 characters"}), 400
    if 'role' in data and (len(data['role']) > 50 or not isinstance(data['role'], str)):
        return jsonify({"error": "role must be a string and less than 50 characters"}), 400

    try:
        # Update the admin's details
        admin.admin_firstname = data.get('admin_firstname', admin.admin_firstname)
        admin.admin_lastname = data.get('admin_lastname', admin.admin_lastname)
        admin.email = data.get('email', admin.email)
        admin.oauth_id = data.get('oauth_id', admin.oauth_id)
        admin.role = data.get('role', admin.role)
        db.session.commit()
        return jsonify(admin.to_dict()), 200

    except Exception as e:
        # Log the error for debugging
        app.logger.error(f"Error updating admin: {e}")
        return jsonify({"error": "An error occurred while updating the admin", "details": str(e)}), 500


@app.route('/admins/<int:id>', methods=['DELETE'])
def delete_admin(id):
    """
    Delete an admin by their ID.
    """
    try:
        # Find the admin by ID
        admin = db.session.query(Admin).filter_by(id=id).first()

        # If the admin doesn't exist, return an error
        if not admin:
            return jsonify({"error": "Admin not found"}), 404

        # Delete the admin from the database
        db.session.delete(admin)
        db.session.commit()

        return jsonify({"message": f"Admin with ID {id} has been deleted"}), 200

    except Exception as e:
        # Log the error for debugging
        app.logger.error(f"Error deleting admin: {e}")
        return jsonify({"error": "An error occurred while deleting the admin", "details": str(e)}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to ensure the app and database are up
    """
    try:
        # This would execute a test query to check if DB is reachable
        # db.session.execute('SELECT 1')
        return jsonify({'status': 'healthy'}), 200
    except Exception as e:
        return jsonify({'error': f"Database error: {str(e)}"}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Ensures the database tables are created on app startup
    port = int(os.getenv('TEACHERS_PORT', 5004))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'  # Set to True for debugging, False for production
    app.run(host='0.0.0.0', port=port, debug=debug)
