#!/bin/bash

# This script starts all microservices in new Terminal tabs and logs output to respective log files.
# Only works on macOS
# Run from project root

cd ./backend

pip install -r requirements.txt

source env/bin/activate

# Function to start services in new Terminal tabs
start_service() {
    service_name=$1
    script_path=$2
    log_file="logs/${service_name}.log"

    mkdir -p logs  # Ensure logs directory exists

    osascript <<EOF
tell application "Terminal"
    do script "cd \"$(pwd)\"; source env/bin/activate; python3 $script_path 2>&1 | tee $log_file"
end tell
EOF
}

# Start the database proxy
start_service "Google Cloud SQL proxy" "./cloud-sql-proxy citizen-science-app-for-kids:us-central1:citizen-science-instance"

# Start individual microservices
start_service "Observations" "observations.py"
start_service "Classrooms" "classrooms.py"
start_service "Students" "students.py"
start_service "Admins" "admin.py"
start_service "Projects" "projects.py"
start_service "API" "api_gateway.py"

echo "All microservices started."

# Start the frontend
cd ../frontend/web-citizen-science || exit
npm start
