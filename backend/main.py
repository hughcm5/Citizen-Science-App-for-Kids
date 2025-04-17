import mysql.connector

# Set up your database connection
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="buster2003",
    database="testdb"
)

cursor = conn.cursor()

# Read and split SQL commands
with open("ddl.sql", "r") as file:
    sql_script = file.read()

commands = [cmd.strip() for cmd in sql_script.split(';') if cmd.strip()]

for command in commands:
    try:
        cursor.execute(command)
        if cursor.with_rows:
            results = cursor.fetchall()
            for row in results:
                print(row)

    except mysql.connector.Error as err:
        print("Error")


conn.commit()
cursor.close()
conn.close()
