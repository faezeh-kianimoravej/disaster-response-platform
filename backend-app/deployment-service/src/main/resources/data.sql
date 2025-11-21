-- =========================================
--  Response Units (Base Seed Data)
-- =========================================
INSERT INTO response_units (
    unit_id, unit_name, department_id, unit_type, status,
    current_deployment_id, latitude, longitude,
    last_location_update, created_at, updated_at
)
VALUES
(1, 'Fire Response Unit Alpha',   1, 'FIRE_TRUCK', 'AVAILABLE', NULL, 52.2215, 6.8937, NOW(), NOW(), NOW()),
(2, 'Fire Response Unit Bravo',   1, 'FIRE_TRUCK', 'AVAILABLE', NULL, 52.2225, 6.8947, NOW(), NOW(), NOW()),
(3, 'Ambulance Response Unit',    3, 'AMBULANCE',  'AVAILABLE', NULL, 52.2235, 6.8955, NOW(), NOW(), NOW()),
(4, 'Fire Response Unit Charlie', 4, 'FIRE_TRUCK', 'AVAILABLE', NULL, 52.2245, 6.8967, NOW(), NOW(), NOW())
ON CONFLICT (unit_id) DO NOTHING;

-- =========================================
-- Default Resources (Required Resources)
-- =========================================
INSERT INTO response_unit_default_resources (unit_id, resource_id, quantity, required_quantity, is_primary)
VALUES
(1, 10, 1, 1, TRUE),
(2, 11, 1, 1, TRUE),
(3, 20, 1, 1, TRUE),
(4, 12, 1, 1, TRUE)
ON CONFLICT (unit_id, resource_id) DO NOTHING;

-- =========================================
-- Default Personnel (Required Skills)
-- =========================================
INSERT INTO response_unit_default_personnel (id, unit_id, user_id, specialization, is_required)
VALUES
-- Unit 1 (Fire Truck Alpha)
(1, 1, NULL, 'FIREFIGHTER', TRUE),
(2, 1, NULL, 'DRIVER', TRUE),
(3, 1, NULL, 'OPERATOR', TRUE),

-- Unit 2 (Fire Truck Bravo)
(4, 2, NULL, 'FIREFIGHTER', TRUE),
(5, 2, NULL, 'DRIVER', TRUE),
(6, 2, NULL, 'OPERATOR', TRUE),

-- Unit 3 (Ambulance)
(7, 3, NULL, 'PARAMEDIC', TRUE),
(8, 3, NULL, 'DRIVER', TRUE),

-- Unit 4 (Fire Truck Charlie)
(9, 4, NULL, 'FIREFIGHTER', TRUE),
(10, 4, NULL, 'DRIVER', TRUE),
(11, 4, NULL, 'OPERATOR', TRUE)
ON CONFLICT (id) DO NOTHING;

-- =========================================
-- Current Resources (Actual resources — must match @Embeddable)
-- =========================================
INSERT INTO response_unit_current_resources (unit_id, resource_id, quantity, is_primary)
VALUES
-- Unit 1: fully valid
(1, 10, 1, TRUE),

-- Unit 2: invalid (primary qty = 0)
(2, 11, 0, TRUE),

-- Unit 3: fully valid ambulance
(3, 20, 1, TRUE),

-- Unit 4: valid resources only
(4, 12, 1, TRUE);

-- =========================================
-- Current Personnel (Actual crew — must match @Embeddable)
-- =========================================
INSERT INTO response_unit_current_personnel (unit_id, user_id, specialization)
VALUES
-- Unit 1 (valid)
(1, 101, 'FIREFIGHTER'),
(1, 102, 'DRIVER'),
(1, 103, 'OPERATOR'),

-- Unit 2 (personnel OK but resource invalid)
(2, 201, 'FIREFIGHTER'),
(2, 202, 'DRIVER'),
(2, 203, 'OPERATOR'),

-- Unit 3 (ambulance valid)
(3, 301, 'PARAMEDIC'),
(3, 302, 'DRIVER'),

-- Unit 4 (invalid personnel)
(4, 401, 'DRIVER'),
(4, 402, 'OPERATOR');
