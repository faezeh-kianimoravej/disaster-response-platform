package nl.saxion.disaster.notification_service.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;
import nl.saxion.disaster.notification_service.model.entity.Notification;
import nl.saxion.disaster.notification_service.model.enums.NotificationStatus;
import nl.saxion.disaster.notification_service.model.enums.NotificationType;
import nl.saxion.disaster.notification_service.repository.contract.NotificationRepository;
import nl.saxion.disaster.shared.event.IncidentEvent;
import nl.saxion.disaster.notification_service.service.contract.IncidentNotificationService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

/**
 * Listens to "incidents" topic in Kafka.
 * When a new incident event arrives, it:
 * 1. Saves a notification in DB.
 * 2. Sends it to region-service via Feign client.
 * 3. Updates delivery status accordingly.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IncidentListener {

    private final IncidentNotificationService incidentNotificationService;
    private final NotificationRepository notificationRepository;

    @KafkaListener(topics = "incidents", groupId = "notification-group")
    public void handleIncidentEvent(IncidentEvent event) {
        log.info("Received IncidentEvent from Kafka: incidentId={}", event.incidentId());

        //Create Notification entity
        Notification notification = Notification.builder()
            .incidentId(event.incidentId())
            .regionId(event.regionId())
            .notificationType(NotificationType.NEW_INCIDENT)
            .title(event.incidentTitle())
            .description(event.incidentDescription())
            .createdAt(java.time.OffsetDateTime.now())
            .read(false)
            .build();

        try {
            //Save notification in DB
            notificationRepository.createNotification(notification);
            log.info("Notification saved successfully for incidentId={}", event.incidentId());
        } catch (Exception e) {
            log.error("Failed to save notification in DB: {}", e.getMessage(), e);
            return;
        }

        // Broadcast notification to SSE clients for the region
        try {
            IncidentNotificationDto dto = new IncidentNotificationDto(
                notification.getId(),
                notification.getIncidentId(),
                notification.getRegionId(),
                "New Incident - " + notification.getTitle(),
                notification.getDescription(),
                notification.getNotificationType(),
                notification.getCreatedAt(),
                notification.isRead()
            );
            incidentNotificationService.broadcastIncidentNotification(dto);
            log.info("Broadcasted notification to SSE clients for regionId={} incidentId={}", notification.getRegionId(), event.incidentId());
        } catch (Exception e) {
            log.error("Failed to broadcast notification for incidentId={} → {}", event.incidentId(), e.getMessage());
        }
    }
}