import os
import requests
from requests.exceptions import RequestException
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS


"""
Comments / things to do or look into:
- Implement token verification logic in verify_token function
- Implement authentication for the services
- Implement logging errors for the gateway (app.logger.error ?) / Google Cloud Logging
"""

# Load environment variables
load_dotenv('../.env')

# Initialize Flask app
app = Flask(__name__)
# CORS configuration
CORS(app,
     origins=os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(','),
     supports_credentials=True
     )


# URLs of the backend services
# replace with the actual URLs of your services once on the cloud
SERVICE_URLS = {
    'projects': os.getenv('PROJECTS_SERVICE_URL') or 'http://localhost:5051',
    'observations': os.getenv('OBSERVATIONS_SERVICE_URL') or 'http://localhost:5052',
    'students': os.getenv('STUDENTS_SERVICE_URL') or 'http://localhost:5053',
    'teachers': os.getenv('TEACHERS_SERVICE_URL') or 'http://localhost:5054',
    'csv': os.getenv('CSV_SERVICE_URL') or 'http://localhost:5055',
}


def verify_token(token):
    """
    Verify the token with google auth service.

    to be implemented

    """
    # TODO - Implement token verification logic
    pass


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint to verify the status of all services.
    Returns a JSON response with the status of each service.

    Each service need to implement a health check endpoint that returns 200 OK
    if the service is running properly.
    """
    results = {}
    for service in SERVICE_URLS:
        service_url = SERVICE_URLS.get(service)
        if not service_url:
            results[service] = 'not configured'  # URL not set in environment variables or wrong URL
            continue

        try:
            timeout = int(os.getenv('HEALTH_CHECK_TIMEOUT', 5))  # Default timeout is 5 seconds
            response = requests.get(f"{service_url}/health", timeout=timeout)
            results[service] = 'ok' if response.status_code == 200 else 'unavailable'
        except requests.RequestException as e:
            results[service] = f'unavailable: {repr(e)}'

    return jsonify({
        'status': 'ok',
        'services': results
    }), 200


# Forwards requests to the appropriate service
def forward_service(service_url):
    """
    Forwards the request to the appropriate service based on the URL.

    """
    try:
        target_url = f"{service_url}{request.path}"
        # Headers to exclude from the forwarded request since they might cause issues
        response = requests.request(
            method=request.method,
            url=target_url,
            headers={key: value for key, value in request.headers.items() if key.lower() not in ['host', 'content-length']},
            params=request.args,
            json=request.get_json(silent=True) or {}
        )
        content_type = response.headers.get('Content-Type', '')
        if content_type.startswith('application/json'): 
            return jsonify(response.json()), response.status_code  # Ensures a JSON response
        return response.content, response.status_code  # For passing other file types like CSVs
    except requests.RequestException as e:
        return jsonify({'Error': 'Service unavailable', 'details': repr(e)}), 503

# Main gateway route
@app.route('/<service>', methods=['GET', 'POST', 'PUT', 'DELETE'])
@app.route('/<service>/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def gateway(service, path=None):
    # Validate service
    service = service.lower()
    if service not in SERVICE_URLS.keys():
        return jsonify({'Error': f'Unknown service: {service}'}), 404

    # No authentication for certain services as listed in the environment variable
    NO_AUTH_SERVICES = os.getenv('NO_AUTH_SERVICES', "projects,observations,csv").split(',')
    # TODO: Implement Google OAuth token verification
    # if service not in NO_AUTH_SERVICES:
    #     # Check for token in headers
    #     # Will be implemented in the future
    #     if not verify_token(token):
    #         return jsonify({'Error': 'Invalid or expired token'}), 401

    # Forward to target service
    service_url = SERVICE_URLS.get(service)
    if not service_url:
        return jsonify({'Error': f'Service URL for {service} not configured'}), 500
    return forward_service(service_url)


if __name__ == "__main__":
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'false').lower() == 'true' # Set to True for debugging, False for production
    app.run(host='0.0.0.0', port=port, debug=debug) 
