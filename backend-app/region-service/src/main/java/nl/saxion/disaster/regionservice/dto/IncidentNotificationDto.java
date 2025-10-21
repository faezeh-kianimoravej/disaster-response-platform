package nl.saxion.disaster.regionservice.dto;

import nl.saxion.disaster.regionservice.model.enums.NotificationType;

import java.time.LocalDateTime;

public record IncidentNotificationDto(

        Long notificationID,
        Long incidentID,
        String incidentType,
        NotificationType notificationType,
        String message,
        String Severity,
        String Location,
        String Status,
        String createdBy,
        LocalDateTime createdAt,
        LocalDateTime reportedAt
) {
}
