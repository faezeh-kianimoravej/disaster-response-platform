-- =========================================
--  Corrected Response Unit Seed Data (PostgreSQL, matches JPA)
-- =========================================
-- Insert response units
INSERT INTO response_units (
        unit_id,
        unit_name,
        department_id,
        unit_type,
        status,
        current_deployment_id,
        latitude,
        longitude,
        last_location_update,
        created_at,
        updated_at
    )
VALUES (
        1,
        'Fire Response Unit Alpha',
        1,
        'FIRE_TRUCK',
        'AVAILABLE',
        NULL,
        52.2215,
        6.8937,
        NOW(),
        NOW(),
        NOW()
    ),
    (
        2,
        'Fire Response Unit Bravo',
        1,
        'FIRE_TRUCK',
        'AVAILABLE',
        NULL,
        52.2225,
        6.8947,
        NOW(),
        NOW(),
        NOW()
    ),
    (
        3,
        'Ambulance Response Unit',
        3,
        'AMBULANCE',
        'AVAILABLE',
        NULL,
        52.2235,
        6.8955,
        NOW(),
        NOW(),
        NOW()
    ),
    (
        4,
        'Fire Response Unit Charlie',
        4,
        'FIRE_TRUCK',
        'AVAILABLE',
        NULL,
        52.2245,
        6.8967,
        NOW(),
        NOW(),
        NOW()
    ) ON CONFLICT (unit_id) DO NOTHING;
INSERT INTO response_unit_default_resources (
        unit_id,
        resource_id,
        quantity,
        is_primary
    )
VALUES (1, 10, 1, true),
    (2, 11, 1, true),
    (3, 20, 1, true),
    (4, 12, 1, true) ON CONFLICT (unit_id, resource_id) DO NOTHING;
INSERT INTO response_unit_default_personnel (
        id,
        unit_id,
        user_id,
        specialization,
        is_required
    )
VALUES (1, 1, NULL, 'FIREFIGHTER', true),
    (2, 1, NULL, 'FIREFIGHTER', false),
    (3, 1, NULL, 'DRIVER', true),
    (4, 1, NULL, 'OPERATOR', true),
    (5, 2, NULL, 'FIREFIGHTER', true),
    (6, 2, NULL, 'FIREFIGHTER', false),
    (7, 2, NULL, 'DRIVER', true),
    (8, 2, NULL, 'OPERATOR', true),
    (9, 3, NULL, 'PARAMEDIC', true),
    (10, 3, NULL, 'DRIVER', true),
    (11, 4, NULL, 'FIREFIGHTER', true),
    (12, 4, NULL, 'DRIVER', true),
    (13, 4, NULL, 'OPERATOR', true) ON CONFLICT (id) DO NOTHING;
-- Reset sequence to max id after seeding
SELECT setval(
        'response_units_unit_id_seq',
        (
            SELECT MAX(unit_id)
            FROM response_units
        )
    );