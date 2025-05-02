CREATE TABLE IF NOT EXISTS Project (
    project_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    project_settings JSON
);

CREATE TABLE IF NOT EXISTS Observation (
    observation_id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    student_id INT NOT NULL,
    data JSON,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Classroom (
    class_id INT AUTO_INCREMENT PRIMARY KEY,
    class_code VARCHAR(20) NOT NULL UNIQUE,
    admin_id INT NOT NULL,
    class_name VARCHAR(255),
    grade_level VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS Admin (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_lastname VARCHAR(100),
    admin_firstname VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    oauth_id VARCHAR(255) UNIQUE,
    role ENUM('teacher') NOT NULL
);

CREATE TABLE IF NOT EXISTS Student (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    class_id INT NOT NULL,
    student_lastname VARCHAR(100),
    student_firstname VARCHAR(100),
    class_codes VARCHAR(255)
);
