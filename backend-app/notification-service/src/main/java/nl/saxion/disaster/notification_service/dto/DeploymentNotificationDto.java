package nl.saxion.disaster.notification_service.dto;

import nl.saxion.disaster.notification_service.model.enums.NotificationType;

import java.time.OffsetDateTime;

public record DeploymentNotificationDto(

        Long notificationId,
        Long departmentId,
        Long deploymentRequestId,
        String title,
        String description,
        NotificationType notificationType,
        OffsetDateTime createdAt,
        boolean read
) {
}
