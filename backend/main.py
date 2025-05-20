import json
import datetime
from db_connector import connect_to_database
from flask import Flask
from flask_cors import CORS

# Get a connection
connection = connect_to_database()
cursor = connection.cursor()
app = Flask(__name__)
CORS(app, origins=["http://localhost:8081"])

# Read SQL script
with open("app_schema.sql", "r") as file:
    lines = file.readlines()

# Split into individual statements
commands = [cmd.strip() for cmd in lines.split(';') if cmd.strip()]

# Execute each command
for command in commands:
    try:
        cursor.execute(command)
    except Exception as err:
        print("Error:", err)


# Query and convert to JSON
try:
    cursor.execute("SELECT * FROM Project")
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]

    result_list = [dict(zip(columns, row)) for row in rows]
    # output data into console
    json_output = json.dumps(result_list, indent=2, default=str)

    print(json_output)

except Exception as err:
    print("SELECT Error:", err)

# Cleanup
cursor.close()
connection.close()
