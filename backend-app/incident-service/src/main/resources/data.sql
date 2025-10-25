
INSERT INTO incidents (
    reported_by, title, description, severity, grip_level, status, reported_at, location, latitude, longitude, region_id, created_at, updated_at
) VALUES
('Fire Department', 'Warehouse Fire', 'Large fire in the industrial area warehouse.', 'HIGH', 'LEVEL_2', 'OPEN', NOW(), 'Industrial Zone A', 52.2215, 6.8937, 1, NOW(), NOW()),
('Police', 'Robbery at Mall', 'Armed robbery reported at central mall. Suspect fled in black car.', 'MEDIUM', 'LEVEL_1', 'IN_PROGRESS', NOW(), 'Downtown Mall', 52.2203, 6.8952, 1, NOW(), NOW()),
('Ambulance Service', 'Traffic Accident', 'Multiple vehicles involved on highway intersection.', 'HIGH', 'LEVEL_3', 'RESOLVED', NOW(), 'A1 Highway Exit 26', 52.2167, 6.9012, 1, NOW(), NOW()),
('Fire Department', 'Gas Leak', 'Possible gas leak reported in residential area.', 'LOW', 'LEVEL_1', 'OPEN', NOW(), 'Elm Street 42', 52.2154, 6.8899, 1, NOW(), NOW()),
('Emergency Coordination Center', 'Flood Alert', 'Rising water levels near the river. Monitoring situation closely.', 'MEDIUM', 'LEVEL_2', 'OPEN', NOW(), 'Riverside District', 52.2301, 6.8804, 1, NOW(), NOW())
;
