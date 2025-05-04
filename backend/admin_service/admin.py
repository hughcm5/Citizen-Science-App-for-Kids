import json
import datetime
from db_connector import connect_to_database as db
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

# Get a connection
connection = db
cursor = connection.cursor()

class Admin:
    __tablename__ = 'admin'
    admin_id = db.Column(db.Integer, primary_key=True)
    admin_lastname = db.Column(db.String(100), nullable=False)
    admin_firstname = db.Column(db.String(100), nullable=False)
    email = db.Columnm(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now, nullable=False)
    ouath_id = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(15), nullable=False)
    # JSON field to store project settings
    project_settings = db.Column(db.JSON, nullable=True)

    def to_dict(self):
        """
        Convert the Project object to a dictionary, so it can be easily be converted to JSON
        """
        return {
            #'id': self.id,
            'admin_id': self.admin_id,
            'admin_lastname': self.admin_lastname,
            'admin_firstname': self.admin_firstname,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'oauth_id': self.ouath_id,
            'role': self.role,
            'project_settings': self.project_settings
        }



@app.route('/admin', methods=['GET'])
def get_admins():
    