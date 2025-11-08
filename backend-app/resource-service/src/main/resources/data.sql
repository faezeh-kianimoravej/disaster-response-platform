-- =========================================
--  Initial Resource Seed Data (PostgreSQL)
-- =========================================
-- Insert resources
INSERT INTO resources (
        resource_id,
        department_id,
        name,
        description,
        quantity,
        available,
        resource_type,
        latitude,
        longitude,
        image,
        created_at,
        updated_at
    )
VALUES -- 🔥 Fire Brigade
    (
        1,
        1,
        'Fire Truck A1',
        'Primary fire response vehicle with 5000L capacity',
        2,
        2,
        'FIRE_TRUCK',
        52.2215,
        6.8937,
        NULL,
        NOW(),
        NOW()
    ),
    (
        2,
        1,
        'Ladder Truck L2',
        'Hydraulic ladder truck with 30m reach',
        1,
        1,
        'FIRE_TRUCK',
        52.2208,
        6.8902,
        NULL,
        NOW(),
        NOW()
    ),
    (
        3,
        1,
        'Rescue Operator Team',
        'Trained firefighters for rescue operations',
        8,
        8,
        'FIELD_OPERATOR',
        52.2220,
        6.8911,
        NULL,
        NOW(),
        NOW()
    ),
    -- 🚓 Police Department
    (
        4,
        2,
        'Patrol Car P1',
        'Standard police patrol vehicle',
        3,
        2,
        'RIOT_CAR',
        52.2180,
        6.8965,
        NULL,
        NOW(),
        NOW()
    ),
    (
        5,
        2,
        'Riot Response Unit',
        'Specialized team for crowd control and riots',
        10,
        10,
        'FIELD_OPERATOR',
        52.2175,
        6.8959,
        NULL,
        NOW(),
        NOW()
    ),
    (
        6,
        2,
        'Transport Van',
        'Used to transport personnel or detainees',
        2,
        1,
        'TRANSPORT_VEHICLE',
        52.2189,
        6.8940,
        NULL,
        NOW(),
        NOW()
    ),
    -- 🚑 City Hospital
    (
        7,
        3,
        'Ambulance A1',
        'Emergency ambulance with advanced life support',
        4,
        3,
        'AMBULANCE',
        52.2230,
        6.8885,
        NULL,
        NOW(),
        NOW()
    ),
    (
        8,
        3,
        'Ambulance A2',
        'Basic ambulance for patient transfer',
        2,
        2,
        'AMBULANCE',
        52.2227,
        6.8897,
        NULL,
        NOW(),
        NOW()
    ),
    (
        9,
        3,
        'Medical Staff',
        'Doctors and nurses available for emergency',
        25,
        20,
        'FIELD_OPERATOR',
        52.2240,
        6.8871,
        NULL,
        NOW(),
        NOW()
    ),
    -- 🧱 City Services / Infrastructure
    (
        10,
        4,
        'Maintenance Van',
        'Used for city infrastructure maintenance',
        3,
        2,
        'TRANSPORT_VEHICLE',
        52.2260,
        6.8830,
        NULL,
        NOW(),
        NOW()
    ),
    (
        11,
        4,
        'Repair Crew',
        'Team responsible for electrical and plumbing repairs',
        6,
        5,
        'FIELD_OPERATOR',
        52.2271,
        6.8842,
        NULL,
        NOW(),
        NOW()
    ),
    (
        12,
        4,
        'Water Pump Vehicle',
        'Used during city floods and emergencies',
        1,
        1,
        'TRANSPORT_VEHICLE',
        52.2254,
        6.8827,
        NULL,
        NOW(),
        NOW()
    ) ON CONFLICT (resource_id) DO NOTHING;
-- Prevent duplicate inserts if script runs multiple times
-- Reset sequence to avoid conflicts
SELECT setval(
        'resources_resource_id_seq',
        (
            SELECT MAX(resource_id)
            FROM resources
        )
    );