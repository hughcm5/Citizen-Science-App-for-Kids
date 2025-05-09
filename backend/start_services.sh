#!/bin/bash


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
start_service "Admins" "admins.py"&
start_service "Projects" "projects.py"&
start_service "API" "api_gateway.py"


echo "All microservices started."
