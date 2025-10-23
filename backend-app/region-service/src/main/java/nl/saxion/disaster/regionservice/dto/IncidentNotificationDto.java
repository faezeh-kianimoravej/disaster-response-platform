package nl.saxion.disaster.regionservice.dto;

import nl.saxion.disaster.regionservice.model.enums.NotificationType;
import java.time.OffsetDateTime;

public record IncidentNotificationDto(
        Long notificationId,
        Long incidentId,
        String title,
        String description,
        NotificationType notificationType,
        OffsetDateTime createdAt,
        boolean read
) {}
