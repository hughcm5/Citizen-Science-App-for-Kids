import mysql.connector

# Connect to the database
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="buster2003",
    database="testdb"
)

cursor = conn.cursor()

# Step 1: Run SQL file (optional, only if needed again)
with open("ddl.sql", "r") as file:
    sql_script = file.read()

commands = [cmd.strip() for cmd in sql_script.split(';') if cmd.strip()]

for command in commands:
    try:
        cursor.execute(command)
        # Clear any unread results
        while cursor.next_result():
            pass
    except mysql.connector.Error as err:
        print("Error:", err)

# Step 2: Run SELECT query
try:
    cursor.execute("SELECT * FROM TestTable")
    results = cursor.fetchall()

    for row in results:
        print(row)

except mysql.connector.Error as err:
    print("SELECT Error:", err)

# Step 3: Clean up
cursor.close()
conn.close()
