-- Disable foreign key checks and autocommit
SET FOREIGN_KEY_CHECKS=0;
SET AUTOCOMMIT = 0;

-- Create table
DROP TABLE IF EXISTS TestTable;
CREATE TABLE TestTable (
    projectID INT(5) NOT NULL,
    projectName VARCHAR(100),
    grade int,
    PRIMARY KEY (projectID)
);

-- Create mock data
INSERT INTO TestTable (projectID, projectName, grade)
VALUES
    (12345, 'Science Project A', 5),
    (54321, 'Science Project B', 3),
    (12842, 'Science Project C', 4);

-- Show table
--Select * from TestTable;

SET FOREIGN_KEY_CHECKS=1;
COMMIT;
