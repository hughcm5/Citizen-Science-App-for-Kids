import os
import requests
from requests.exceptions import RequestException
from dotenv import load_dotenv, find_dotenv
from flask import Flask, request, jsonify, redirect, url_for, session
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
import uuid
from google.cloud import secretmanager

# Load environment variables
load_dotenv(find_dotenv())

# Initialize Flask app
app = Flask(__name__)
# Configure session management
app.config.update(
    SESSION_COOKIE_SAMESITE='None',
    SESSION_COOKIE_SECURE=True
)
# CORS configuration
CORS(app,
     origins=os.getenv('CORS_ORIGINS', 'http://localhost:8081').split(','),
     supports_credentials=True
     )


# Secret key for session management
app.secret_key = str(uuid.uuid4())

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
    CLIENT_ID = access_secret_version(PROJECT_ID, "CLIENT_ID")
    CLIENT_SECRET = access_secret_version(PROJECT_ID, "CLIENT_SECRET")
    GOOGLE_CLIENT_SECRET = access_secret_version(PROJECT_ID, "GOOGLE_CLIENT_SECRET")
else:
    CLIENT_ID = os.getenv('CLIENT_ID')
    CLIENT_SECRET = os.getenv('CLIENT_SECRET')

DOMAIN = os.getenv('AUTH0_DOMAIN')
REDIRECT_URI = os.getenv('REDIRECT_URI', 'http://localhost:5000/oauth/callback')
BASE_URL = f"https://{DOMAIN}"

oauth = OAuth(app)

auth0 = oauth.register(
    'auth0',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    api_base_url="https://" + DOMAIN,
    access_token_url="https://" + DOMAIN + "/oauth/token",
    authorize_url="https://" + DOMAIN + "/authorize",
    server_metadata_url='https://dev-tmf2tlri8xgzzr2y.us.auth0.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid profile email',
    },

)

# URLs of the backend services
SERVICE_URLS = {
    'projects': os.getenv('PROJECTS_SERVICE_URL') or 'http://localhost:5001',
    'observations': os.getenv('OBSERVATIONS_SERVICE_URL') or 'http://localhost:5002',
    'students': os.getenv('STUDENTS_SERVICE_URL') or 'http://localhost:5003',
    'admins': os.getenv('TEACHERS_SERVICE_URL') or 'http://localhost:5004',
    'classrooms': os.getenv('CLASSROOMS_SERVICE_URL') or 'http://localhost:5006',
}


@app.route('/health', methods=['GET'])
def health_check():
    results = {}
    for service in SERVICE_URLS:
        service_url = SERVICE_URLS.get(service)
        if not service_url:
            results[service] = 'not configured'
            continue

        try:
            timeout = int(os.getenv('HEALTH_CHECK_TIMEOUT', 5))
            response = requests.get(f"{service_url}/health", timeout=timeout)
            results[service] = 'ok' if response.status_code == 200 else 'service unavailable: status code ' + str(response.status_code) + f" ({response.text})" + f" ({service_url})"
        except requests.RequestException as e:
            results[service] = f'unavailable: {repr(e)}'

    return jsonify({
        'API Gateway status': 'ok',
        'services': results
    }), 200


# Login Route
@app.route('/login')
def login():
    return auth0.authorize_redirect(redirect_uri=REDIRECT_URI)


# Callback Route
@app.route('/oauth/callback')
def callback():
    token = auth0.authorize_access_token()
    userinfo = auth0.get('userinfo').json()

    # Store user info in session
    session['user'] = {
        'jwt': token['access_token'],
        'email': userinfo['email'],
        'name': userinfo.get('name'),
        'sub': userinfo.get('sub')  # OAuth ID
    }

    # Attempt to create admin if not already exists
    try:
        admin_service_url = SERVICE_URLS['admins']

        # Check if the admin already exists
        check_response = requests.get(
            f"{admin_service_url}/admins",
            headers={'Authorization': f"Bearer {token['access_token']}"}
        )

        if check_response.status_code == 200:
            existing_admins = check_response.json()
            email = userinfo['email']

            if not any(admin['email'] == email for admin in existing_admins):
                # Split name into first and last name
                name_parts = userinfo.get('name', '').split()
                firstname = name_parts[0] if name_parts else 'Unknown'
                lastname = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''

                # Send POST request to create the admin
                create_response = requests.post(
                    f"{admin_service_url}/admins",
                    headers={
                        'Authorization': f"Bearer {token['access_token']}",
                        'Content-Type': 'application/json'
                    },
                    json={
                        'email': email,
                        'admin_firstname': firstname,
                        'admin_lastname': lastname,
                        'oauth_id': userinfo.get('sub'),
                        'role': 'teacher'
                    }
                )
                if create_response.status_code not in [200, 201]:
                    app.logger.error(f"Failed to create admin: {create_response.text}")

        else:
            app.logger.error(f"Failed to fetch existing admins: {check_response.text}")

    except Exception as e:
        app.logger.error(f"Error during admin creation: {e}")

    return redirect(os.getenv("FRONTEND_REDIRECT_URL", "http://localhost:3000"))


# Logout Route
@app.route('/logout')
def logout():
    session.clear()
    return redirect(
        f"https://{DOMAIN}/v2/logout?client_id={CLIENT_ID}&returnTo={os.getenv('FRONTEND_REDIRECT_URL', 'http://localhost:3000')}"
    )

@app.route('/session', methods=['GET'])
def session_status():
    """
    Sends signal to frontend to let frontend know if user is logged in
    """
    user = session.get('user')
    if user:
        return jsonify({
            'logged_in': True,
            'user': {
                'email': user.get('email'),
                'name': user.get('name'),
                'sub': user.get('sub')
            }
        }), 200
    else:
        return jsonify({'logged_in': False}), 200


# Forwards requests to the appropriate service
def forward_service(service_url):
    try:
        target_url = f"{service_url}{request.path}"

        args = {
            'method': request.method,
            'url': target_url,
            'headers': {key: value for key, value in request.headers.items() if key.lower() not in ['host', 'content-length']},
            'params': request.args,
        }

        if request.method in ['POST', 'PUT', 'PATCH']:
            # Check if the original request had a JSON body
            if request.content_type and 'application/json' in request.content_type.lower():
                try:
                    original_json_data = request.get_json()
                    if original_json_data is not None:
                        args['json'] = original_json_data
                except Exception as e:
                    return jsonify({'Error': 'Invalid JSON data', 'details': str(e)}), 400
            elif request.data:
                args['data'] = request.data

        response = requests.request(**args)

        content_type = response.headers.get('Content-Type', '')
        if content_type.startswith('application/json'): 
            return jsonify(response.json()), response.status_code
        return response.content, response.status_code
    except requests.RequestException as e:
        return jsonify({'Error': 'Service unavailable', 'details': repr(e)}), 503

# Main gateway route
@app.route('/<service>', methods=['GET', 'POST', 'PUT', 'DELETE'])
@app.route('/<service>/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def gateway(service, path=None):
    service = service.lower()
    if service not in SERVICE_URLS.keys():
        return jsonify({'Error': f'Unknown service: {service}'}), 404

    service_url = SERVICE_URLS.get(service)
    if not service_url:
        return jsonify({'Error': f'Service URL for {service} not configured'}), 500
    return forward_service(service_url)


if __name__ == "__main__":
    port = int(os.getenv('GATEWAY_PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
