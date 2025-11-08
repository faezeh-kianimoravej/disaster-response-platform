INSERT INTO incidents (
        incident_id,
        reported_by,
        title,
        description,
        severity,
        grip_level,
        status,
        reported_at,
        location,
        latitude,
        longitude,
        region_id,
        created_at,
        updated_at
    )
VALUES (
        1,
        'Fire Department',
        'Warehouse Fire',
        'Large fire in the industrial area warehouse.',
        'HIGH',
        'LEVEL_2',
        'OPEN',
        NOW(),
        'Industrial Zone A',
        52.2215,
        6.8937,
        1,
        NOW(),
        NOW()
    ),
    (
        2,
        'Police',
        'Robbery at Mall',
        'Armed robbery reported at central mall. Suspect fled in black car.',
        'MEDIUM',
        'LEVEL_1',
        'IN_PROGRESS',
        NOW(),
        'Downtown Mall',
        52.2203,
        6.8952,
        1,
        NOW(),
        NOW()
    ),
    (
        3,
        'Ambulance Service',
        'Traffic Accident',
        'Multiple vehicles involved on highway intersection.',
        'HIGH',
        'LEVEL_3',
        'RESOLVED',
        NOW(),
        'A1 Highway Exit 26',
        52.2167,
        6.9012,
        1,
        NOW(),
        NOW()
    ),
    (
        4,
        'Fire Department',
        'Gas Leak',
        'Possible gas leak reported in residential area.',
        'LOW',
        'LEVEL_1',
        'OPEN',
        NOW(),
        'Elm Street 42',
        52.2154,
        6.8899,
        1,
        NOW(),
        NOW()
    ),
    (
        5,
        'Emergency Coordination Center',
        'Flood Alert',
        'Rising water levels near the river. Monitoring situation closely.',
        'MEDIUM',
        'LEVEL_2',
        'OPEN',
        NOW(),
        'Riverside District',
        52.2301,
        6.8804,
        1,
        NOW(),
        NOW()
    ) ON CONFLICT (incident_id) DO NOTHING;
-- Reset sequence to avoid conflicts
SELECT setval(
        'incidents_incident_id_seq',
        (
            SELECT MAX(incident_id)
            FROM incidents
        )
    );