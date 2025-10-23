package nl.saxion.disaster.notification_service.dto;

import nl.saxion.disaster.notification_service.model.enums.NotificationType;

import java.time.OffsetDateTime;

public record IncidentNotificationDto(
    Long notificationId,
    Long incidentId,
    Long regionId,
    String title,
    String description,
    NotificationType notificationType,
    OffsetDateTime createdAt,
    boolean read
) {}
