-- Mock Data for admin

-- Disable foreign key checks and autocommit
SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT = 0;

-- Create mock data
INSERT INTO admin (admin_lastname, admin_firstname, email, oauth_id, role)
VALUES
    ('Miller', 'Bob', 'example@gmail.com', 00001, 'teacher'),
    ('Bunny', 'Lucky', 'example2@gmail.com', 10000, 'teacher'),
    ('Smith', 'Sally', 'examplesmith@gmail.com', 4, 'teacher')
;

-- Show table
-- Select * from admin;

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
