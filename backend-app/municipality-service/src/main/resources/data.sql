-- ============================
-- Initial Municipalities (3)
-- ============================

INSERT INTO municipality (name, region_id, image, created_at, updated_at)
VALUES
('Deventer', 1, decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64'), now(), now()),
('Enschede', 1, decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64'), now(), now()),
('Zwolle', 1, decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64'), now(), now());
