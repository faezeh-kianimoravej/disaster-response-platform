-- =========================================
--  Initial Notification Seed Data (PostgreSQL)
-- =========================================
-- Insert notifications
INSERT INTO notifications (
        notification_id,
        incident_id,
        region_id,
        notification_type,
        title,
        description,
        created_at,
        read
    )
VALUES (
        1,
        1,
        1,
        'NEW_INCIDENT',
        'Large fire',
        'Fire in the industrial area warehouse.',
        NOW() - INTERVAL '1 day',
        false
    ) ON CONFLICT (notification_id) DO NOTHING;
-- Reset sequence to max id after seeding
SELECT setval(
        'notifications_notification_id_seq',
        (
            SELECT MAX(notification_id)
            FROM notifications
        )
    );