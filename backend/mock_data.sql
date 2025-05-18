-- Mock Data for admin & classroom entities

-- Disable foreign key checks and autocommit
SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT = 0;

-- Create mock data --

-- Mock Data for admin
INSERT INTO admin (admin_lastname, admin_firstname, email, oauth_id, role)
VALUES
    ('Miller', 'Bob', 'example@gmail.com', 00001, 'teacher'),
    ('Bunny', 'Lucky', 'example2@gmail.com', 10000, 'teacher'),
    ('Smith', 'Sally', 'examplesmith@gmail.com', 4, 'teacher')
;

-- Mock Data for Classroom
INSERT INTO Classroom (class_code, admin_id, class_name, grade_level)
VALUES
    (12345, 12345, 'Test Classroom', '5'),
    (45678, 4, 'Sallys Class', 'Kinder'),
    (78901, 10000, 'Capstone Project', '12');

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
