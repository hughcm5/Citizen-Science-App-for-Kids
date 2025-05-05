from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

"""
This file contains the SQLAlchemy models for the application.
The models are used to interact with the database and define the structure of the data.
The microservices will import these models to interact with the database.
"""

db = SQLAlchemy()

# ------------------Models------------------#

# Admin table (used for teachers/admins)
class Admin(db.Model):
    __tablename__ = 'admin'
    admin_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    admin_lastname = db.Column(db.String(100))
    admin_firstname = db.Column(db.String(100))
    email = db.Column(db.String(255), unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    oauth_id = db.Column(db.String(255), unique=True)
    role = db.Column(db.Enum('teacher'), nullable=False)

    classrooms = db.relationship('Classroom', backref='admin', lazy=True)


# Classroom table
class Classroom(db.Model):
    __tablename__ = 'classroom'
    class_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    class_code = db.Column(db.String(20), unique=True, nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.admin_id'), nullable=False)
    class_name = db.Column(db.String(255))
    grade_level = db.Column(db.String(50))

    students = db.relationship('Student', backref='classroom', lazy=True)
    projects = db.relationship('Project', backref='classroom', lazy=True)


# Student table
class Student(db.Model):
    __tablename__ = 'student'
    student_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classroom.class_id', ondelete='CASCADE'), nullable=False)
    student_lastname = db.Column(db.String(100))
    student_firstname = db.Column(db.String(100))
    class_codes = db.Column(db.String(255))  # unclear if this is redundant with class_id

    observations = db.relationship('Observation', backref='student', lazy=True, cascade='all, delete-orphan')


# Project table
class Project(db.Model):
    __tablename__ = 'project'
    project_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    class_id = db.Column(db.Integer, db.ForeignKey('classroom.class_id', ondelete='CASCADE'), nullable=False)
    project_title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    project_settings = db.Column(db.JSON)

    observations = db.relationship('Observation', backref='project', lazy=True, cascade='all, delete-orphan')


# Observation table
class Observation(db.Model):
    __tablename__ = 'observation'
    observation_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.project_id', ondelete='CASCADE'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('student.student_id', ondelete='CASCADE'), nullable=False)
    data = db.Column(db.JSON)
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc))


with app.app_context():
    db.create_all()
