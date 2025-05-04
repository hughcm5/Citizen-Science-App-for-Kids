import json
import datetime
from db_connector import connect_to_database

# Get a connection
connection = connect_to_database()
cursor = connection.cursor()


