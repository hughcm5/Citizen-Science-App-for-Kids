-- Disable foreign key checks and autocommit
SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT = 0;

-- Create table
DROP TABLE IF EXISTS TestTable;
CREATE TABLE TestTable (
    projectID INT NOT NULL AUTO_INCREMENT,
    projectName VARCHAR(100),
    grade VARCHAR(10),
    PRIMARY KEY (projectID)
);

-- Create mock data
INSERT INTO TestTable (projectName, grade)
VALUES
    ('Science Project A', '5th'),
    ('Science Project B', '6th'),
    ('Science Project C', '4th');

-- Show table
Select * from TestTable;

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
