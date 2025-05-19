import json
import datetime
import re
from db_connector import connect_to_database

# Get a connection
connection = connect_to_database()
cursor = connection.cursor()

# Read SQL script as a single string
with open("inserts.sql", "r") as file:
    sql = file.read()

sql = re.sub(r'--', "", sql) #skip comments


# Split into individual statements
commands = [cmd.strip() for cmd in sql.split(';') if cmd.strip()]

# Execute each command
for command in commands:
    cursor.execute(command)

# Commit changes
connection.commit()

# Cleanup
cursor.close()
connection.close()
