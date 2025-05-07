import os
import requests
import json
import pymysql
import logging
from datetime import datetime
from requests.exceptions import RequestException
from dotenv import load_dotenv
from flask import Flask, request, jsonify, redirect, url_for, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from models import db, Admin
import uuid

# Load environment variables
load_dotenv('./.env')

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


@app.route('/admin', methods=['POST'])
def create_admin():
    print(">>> HIT /admin ROUTE <<<")
    print("Content-Type:", request.content_type)
    print("Headers:", dict(request.headers))
    print("Body:", request.get_data())

    try:
        data = request.get_json()
        if not data or 'email' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        # Check for existing admin
        if Admin.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Admin with this email already exists"}), 409

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


@app.route('/oauth')
def oauth2authorize():
    """
    Redirect user to Google's OAuth 2.0 server for authentication
    """
    state = str(uuid.uuid4())
    session['state'] = state  # Store the state in the session to protect against CSRF
    auth_url = (
        f"{AUTHORIZATION_ENDPOINT}?response_type=code&client_id={CLIENT_ID}"
        f"&redirect_uri={REDIRECT_URI}&scope={SCOPE}&state={state}"
    )
    return redirect(auth_url)


@app.route('/oauth/callback')
def oauth2callback():
    """
    Callback route to handle the response from Google's OAuth 2.0 server
    """
    # Check for the state parameter to protect against CSRF
    if 'state' not in request.args or request.args['state'] != session.get('state'):
        return 'State mismatch. Possible CSRF attack.', 400

    # Retrieve the authorization code from the request
    auth_code = request.args.get('code')
    if not auth_code:
        return "Authorization code not provided.", 400

    token_data = {
        'code': auth_code,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'redirect_uri': REDIRECT_URI,
        'grant_type': 'authorization_code'
    }
    token_response = requests.post(TOKEN_ENDPOINT, data=token_data)
    
    if token_response.status_code == 200:
        token_info = token_response.json()
        access_token = token_info.get('access_token')
        
        if not access_token:
            return "Access token not received.", 400

        session['access_token'] = access_token
        
        # Fetch user info from Google People API
        user_info_response = requests.get(
            PEOPLE_API_URL, 
            headers={'Authorization': f'Bearer {access_token}'}
        )

        if user_info_response.status_code == 200:
            user_info = user_info_response.json()
            # You can store this user info in your database if needed
            return jsonify(user_info), 200
        else:
            return "Failed to fetch user information.", 400
    else:
        # Error handling for token exchange failure
        return "Error during token exchange", 400


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to ensure the app and database are up
    """
    try:
        # This would execute a test query to check if DB is reachable
        db.session.execute('SELECT 1')
        return jsonify({'status': 'healthy'}), 200
    except Exception as e:
        return jsonify({'error': f"Database error: {str(e)}"}), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Ensures the database tables are created on app startup
    port = int(os.getenv('PROJECTS_PORT', 5001))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'  # Set to True for debugging, False for production
    app.run(host='0.0.0.0', port=port, debug=debug)
