
INSERT INTO admin (admin_lastname, admin_firstname, email, created_at, updated_at, oauth_id, role) VALUES
('Brown', 'Robert', 'robert.brown@example.com', UTC_TIMESTAMP(), UTC_TIMESTAMP(), 'oauth456', 'teacher');

INSERT INTO classroom (class_code, admin_id, class_name, grade_level, created_at, updated_at) VALUES
(11002, 1, 'Science Class', '7th Grade', UTC_TIMESTAMP(), UTC_TIMESTAMP());

INSERT INTO student (class_id, student_lastname, student_firstname, created_at, updated_at, class_codes) VALUES
(1, 'student1-last', 'student1-first', UTC_TIMESTAMP(), UTC_TIMESTAMP(), 11001),
(1, 'student2-last', 'student2-first', UTC_TIMESTAMP(), UTC_TIMESTAMP(), 11002),
(1, 'student3-last', 'student3-first', UTC_TIMESTAMP(), UTC_TIMESTAMP(), 11003),
(1, 'student4-last', 'student4-first', UTC_TIMESTAMP(), UTC_TIMESTAMP(), 11004),
(1, 'student5-last', 'student5-first', UTC_TIMESTAMP(), UTC_TIMESTAMP(), 11005);

INSERT INTO project (project_id, class_id, project_title, description, created_at, updated_at, project_settings) VALUES
(11002, 1, 'Volcano Model', 'Create a working volcano model.', UTC_TIMESTAMP(), UTC_TIMESTAMP(), JSON_OBJECT('materials', 'baking soda, vinegar')),
(11006, 1, 'Solar System Model', 'Build a scale model of the solar system.', UTC_TIMESTAMP(), UTC_TIMESTAMP(), JSON_OBJECT('materials', 'foam balls, paint')),
(11007, 1, 'Plant Growth Experiment', 'Track plant growth under different light conditions.', UTC_TIMESTAMP(), UTC_TIMESTAMP(), JSON_OBJECT('variables', 'light exposure', 'duration_days', 14)),
(11008, 1, 'Water Filtration System', 'Build a basic filtration system and test water quality.', UTC_TIMESTAMP(), UTC_TIMESTAMP(), JSON_OBJECT('filters', 'sand, gravel, charcoal', 'test_measurement', 'TDS')),
(11009, 1, 'Magnet Strength Test', 'Test magnetism with different materials.', UTC_TIMESTAMP(), UTC_TIMESTAMP(), JSON_OBJECT('materials', 'iron, copper, plastic', 'measurement', 'paper clips attracted'));

INSERT INTO observation (project_id, student_id, observation_data, created_at, updated_at) VALUES
(11002, 1, JSON_OBJECT('note', 'Volcano went boom'), UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(11006, 2, JSON_OBJECT('note', 'Solar system big'), UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(11007, 3, JSON_OBJECT('note', 'Plant grows'), UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(11008, 4, JSON_OBJECT('note', 'Water quality data collected'), UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(11009, 5, JSON_OBJECT('note', 'Magnets interacted with some materials'), UTC_TIMESTAMP(), UTC_TIMESTAMP());

