import mysql.connector
import db_connector as db
import json



cursor = db.cursor()

# Execute DDL statements
with open("app_schema.sql", "r") as file:
    sql_script = file.read()

commands = [cmd.strip() for cmd in sql_script.split(';') if cmd.strip()]

for command in commands:
    try:
        cursor.execute(command)
    except mysql.connector.Error as err:
        print("Error:", err)

# Query and convert to JSON
try:
    cursor.execute("SELECT * FROM Project")
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]

    result_list = [dict(zip(columns, row)) for row in rows]
    json_output = json.dumps(result_list, indent=2)

    print(json_output)

except mysql.connector.Error as err:
    print("SELECT Error:", err)

cursor.close()