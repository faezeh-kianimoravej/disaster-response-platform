package nl.saxion.disaster.notification_service.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.notification_service.service.contract.DeploymentNotificationService;
import nl.saxion.disaster.shared.event.NewDeploymentRequestEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DeploymentRequestListener {

    private final DeploymentNotificationService notificationService;

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

        notificationService.sendDeploymentNotification(
                event.departmentId(),
                event.deploymentRequestId(),
                event.incidentId(),
                event.createdAt()
        );
    }
}

