package nl.saxion.disaster.notification_service.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.notification_service.dto.DeploymentNotificationDto;
import nl.saxion.disaster.notification_service.model.entity.Notification;
import nl.saxion.disaster.notification_service.model.enums.NotificationType;
import nl.saxion.disaster.notification_service.repository.contract.NotificationRepository;
import nl.saxion.disaster.notification_service.service.contract.DeploymentNotificationService;
import nl.saxion.disaster.shared.event.NewDeploymentRequestEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeploymentRequestListener {

    private final DeploymentNotificationService deploymentNotificationService;
    private final NotificationRepository notificationRepository;

    /**
     * Listens for new deployment request events published by the deployment-service.
     * Each event corresponds to one department-specific deployment request.
     */
    @KafkaListener(
            topics = "new-deployment-requests",
            groupId = "notification-group"
    )
    public void handleNewDeploymentRequest(NewDeploymentRequestEvent event) {
        log.info("Received NewDeploymentRequestEvent: {}", event);

        //Create Notification entity
        Notification notification = Notification.builder()
                .incidentId(event.incidentId())
                .deploymentRequestId(event.deploymentRequestId())
                .departmentId(event.departmentId())
                .notificationType(NotificationType.DEPLOYMENT_REQUEST)
                .description(event.description())
                .createdAt(java.time.OffsetDateTime.now())
                .read(false)
                .build();

        try {
            //Save notification in DB
            notificationRepository.createNotification(notification);
            log.info("Notification saved successfully for departmentId={}", event.departmentId());
        } catch (Exception e) {
            log.error("Failed to save notification in DB: {}", e.getMessage(), e);
            return;
        }

        // Broadcast notification to SSE clients for the department
        try {
            DeploymentNotificationDto dto = new DeploymentNotificationDto(
                    notification.getNotificationId(),
                    notification.getDepartmentId(),
                    "New Incident - " + notification.getTitle(),
                    notification.getDescription(),
                    notification.getNotificationType(),
                    notification.getCreatedAt(),
                    notification.isRead()
            );
            deploymentNotificationService.broadcastDeploymentNotification(dto);
            log.info("Broadcasted notification to SSE clients for departmentId={} incidentId={}", notification.getIncidentId(), event.incidentId());
        } catch (Exception e) {
            log.error("Failed to broadcast notification for departmentId={} → {}", event.departmentId(), e.getMessage());
        }
    }
}

