INSERT INTO incidents (
    department_name,
    title,
    description,
    severity,
    grip_level,
    status,
    reported_at,
    location,
    latitude,
    longitude,
    created_at,
    updated_at
) VALUES
('Fire Department', 'Warehouse Fire', 'Large fire in the industrial area warehouse.', 'HIGH', 'GRIP2', 'OPEN', NOW(), 'Industrial Zone A', 52.2215, 6.8937, NOW(), NOW()),

('Police', 'Robbery at Mall', 'Armed robbery reported at central mall. Suspect fled in black car.', 'MEDIUM', 'GRIP1', 'IN_PROGRESS', NOW(), 'Downtown Mall', 52.2203, 6.8952, NOW(), NOW()),

('Ambulance Service', 'Traffic Accident', 'Multiple vehicles involved on highway intersection.', 'HIGH', 'GRIP3', 'RESOLVED', NOW(), 'A1 Highway Exit 26', 52.2167, 6.9012, NOW(), NOW()),

('Fire Department', 'Gas Leak', 'Possible gas leak reported in residential area.', 'LOW', 'GRIP1', 'OPEN', NOW(), 'Elm Street 42', 52.2154, 6.8899, NOW(), NOW()),

('Emergency Coordination Center', 'Flood Alert', 'Rising water levels near the river. Monitoring situation closely.', 'MEDIUM', 'GRIP2', 'OPEN', NOW(), 'Riverside District', 52.2301, 6.8804, NOW(), NOW());
