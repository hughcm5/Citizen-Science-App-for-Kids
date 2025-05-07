import json
import datetime
from db_connector import connect_to_database as db
from flask import Flask, jsonify, request, redirect, url_for, session
import requests
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from models import Admin
import uuid

app = Flask(__name__)


# Get a connection
connection = db
cursor = connection.cursor()


#TODO: FILL WITH NEW CODES

CLIENT_ID = '213180173282-u1og7fisu1ij193a8qse19kbsjjmppad.apps.googleusercontent.com'
CLIENT_SECRET = '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'  
SCOPE = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
REDIRECT_URI = 'http://localhost:3000/oath'
AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
PEOPLE_API_URL = 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses'

app.secret_key = str(uuid.uuid4())


@app.route('/admin', methods=['GET'])
def get_admins():
    try:
        admins = Admin.query.all()
        admin_list = [admin.to_dict() for admin in admins]
        return jsonify(admin_list), 200
    except Exception as e:
        return jsonify({"error": "Failed to retrieve admins", "details": str(e)}), 500


@app.route('/oath')
def oauth2callback():
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
        
        return redirect(url_for('user_info'))
    else:
        # Error handling for token exchange failure
        return "Error"

@app.route('/user_info')
def user_info():
    access_token = session.get('access_token')
    if not access_token:
        return redirect(url_for('welcome'))

    headers = {'Authorization': f'Bearer {access_token}'}
    profile_response = requests.get(PEOPLE_API_URL, headers=headers)

    if profile_response.status_code != 200:
        return "Error fetching profile info.", 500

    profile = profile_response.json()

    # Extract name and email
    names = profile.get('names', [{}])[0]
    first_name = names.get('givenName')
    last_name = names.get('familyName')
    email = profile.get('emailAddresses', [{}])[0].get('value')
    oauth_id = profile.get('resourceName')  # typically "people/xxxx", optional

    if not email or not first_name or not last_name:
        return "Required user information not available.", 400

    admin = Admin.query.filter_by(email=email).first()

    if admin:
        created = False
    else:
        # Auto-create new admin record
        admin = Admin(
            admin_firstname=first_name,
            admin_lastname=last_name,
            email=email,
            oauth_id=oauth_id,
            role='teacher'  # default role
        )
        db.session.add(admin)
        db.session.commit()
        created = True

    session['admin_email'] = admin.email

    return jsonify({
        "admin_id": admin.admin_id,
        "first_name": admin.admin_firstname,
        "last_name": admin.admin_lastname,
        "email": admin.email,
        "role": admin.role,
        "is_admin": True,
        "created": created
    })

if __name__ == '__main__':
    app.run(debug=True)
