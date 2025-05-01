-- Project DB
CREATE TABLE Project (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    project_settings JSON
);

-- Observation DB
CREATE TABLE Observation (
    observation_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    student_id INT NOT NULL,
    data JSON,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Classroom DB
CREATE TABLE Classroom (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_code VARCHAR(20) NOT NULL UNIQUE,
    admin_id INT NOT NULL,
    class_name VARCHAR(255),
    grade_level VARCHAR(50)
);

-- Admin DB
CREATE TABLE Admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_lastname VARCHAR(100),
    admin_firstname VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    oauth_id VARCHAR(255) UNIQUE,
    role ENUM('teacher') NOT NULL
);

-- Student DB
CREATE TABLE Student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    student_lastname VARCHAR(100),
    student_firstname VARCHAR(100),
    class_codes VARCHAR(255)
);


-- Foreign Keys
ALTER TABLE Project
    ADD CONSTRAINT fk_project_class FOREIGN KEY (class_id) REFERENCES Classroom(class_id);

ALTER TABLE Observation
    ADD CONSTRAINT fk_observation_project FOREIGN KEY (project_id) REFERENCES Project(project_id),
    ADD CONSTRAINT fk_observation_student FOREIGN KEY (student_id) REFERENCES Student(student_id);

ALTER TABLE Classroom
    ADD CONSTRAINT fk_classroom_admin FOREIGN KEY (admin_id) REFERENCES Admin(admin_id);

ALTER TABLE Student
    ADD CONSTRAINT fk_student_class FOREIGN KEY (class_id) REFERENCES Classroom(class_id);
