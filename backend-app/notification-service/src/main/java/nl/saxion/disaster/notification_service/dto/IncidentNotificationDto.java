package nl.saxion.disaster.notification_service.dto;

import nl.saxion.disaster.notification_service.model.enums.NotificationStatus;
import nl.saxion.disaster.notification_service.model.enums.NotificationType;

import java.time.LocalDateTime;

public record IncidentNotificationDto(

        Long notificationID,
        Long incidentID,
        Long regionId,
        String incidentType,
        NotificationType notificationType,
        NotificationStatus notificationStatus,
        String message,
        String Severity,
        String Location,
        String createdBy,
        LocalDateTime createdAt,
        LocalDateTime reportedAt,
        LocalDateTime deliveredAt
) {
}
