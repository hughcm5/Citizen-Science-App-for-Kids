import json
import datetime
from db_connector import connect_to_database as db
from flask import Flask, jsonify, request, redirect, url_for, session
import requests
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import uuid

app = Flask(__name__)


# Get a connection
connection = db
cursor = connection.cursor()


#TODO: FILL WITH NEW CODES

CLIENT_ID = '471459612173-3pen67kmrl7d7eu1qvbpuoudb617meq9.apps.googleusercontent.com'
CLIENT_SECRET = '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'  
SCOPE = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
REDIRECT_URI = 'https://mcbarrohassignment4.uc.r.appspot.com/oath'
AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
PEOPLE_API_URL = 'https://people.googleapis.com/v1/people/me?personFields=names'

app.secret_key = str(uuid.uuid4())

class Admin:
    __tablename__ = 'admin'
    admin_id = db.Column(db.Integer, primary_key=True)
    admin_lastname = db.Column(db.String(100), nullable=False)
    admin_firstname = db.Column(db.String(100), nullable=False)
    email = db.Columnm(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now, nullable=False)
    ouath_id = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(15), nullable=False)
    # JSON field to store project settings
    project_settings = db.Column(db.JSON, nullable=True)

    def to_dict(self):
        """
        Convert the Project object to a dictionary, so it can be easily be converted to JSON
        """
        return {
            #'id': self.id,
            'admin_id': self.admin_id,
            'admin_lastname': self.admin_lastname,
            'admin_firstname': self.admin_firstname,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'oauth_id': self.ouath_id,
            'role': self.role,
            'project_settings': self.project_settings
        }



@app.route('/admin', methods=['GET'])
def get_admins():
    """
    Get all admin users
    """
    pass


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
    # Retrieve access token
    access_token = session.get('access_token')
    
    if not access_token:
        return redirect(url_for('welcome'))

    headers = {'Authorization': f'Bearer {access_token}'}
    profile_response = requests.get(PEOPLE_API_URL, headers=headers)

    if profile_response.status_code == 200:
        profile = profile_response.json()
        given_name = profile.get('names', [{}])[0].get('givenName')
        family_name = profile.get('names', [{}])[0].get('familyName')

        # Display the user info page
        user_info_data = {
            "given_name": given_name,
            "family_name": family_name,
            "state": session['state']
        }
        return jsonify(user_info_data)
    else:
        # Error handling if the profile request fails
        return "Error"

if __name__ == '__main__':
    app.run(debug=True)
