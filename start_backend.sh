#!/bin/bash

# This script starts all microservices in separate terminal windows
# and logs their output to respective log files.
# for local development
# Make sure to run this script from the root directory of the project

# Also this requires xterm to be installed
# Xterm is a terminal emulator and need to be installed separately
# You can install it using the following command:
# "sudo apt install xterm" on Ubuntu/Debian idk for other Operating Systems
# Make sure to give execute permission to this script
# chmod +x start_backend.sh

cd ./backend
source venv/bin/activate

# Function to start services in new terminals
start_service() {
    service_name=$1
    script_path=$2
    log_file="logs/${service_name}.log"
    
    mkdir -p logs  # Ensure logs directory exists
    xterm -hold -e "source venv/bin/activate && python3 $script_path 2>&1 | tee $log_file" &
}

# Start individual microservices
start_service "Observations" "observations.py"&
start_service "Clasrooms" "classrooms.py"&
# start_service "students" "students.py"&
start_service "Admins" "admin.py"&
start_service "Projects" "projects.py"&
start_service "API" "api_gateway.py"


echo "All backend microservices started."
