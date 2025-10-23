package nl.saxion.disaster.notification_service.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.notification_service.client.RegionClient;
import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;
import nl.saxion.disaster.notification_service.model.entity.Notification;
import nl.saxion.disaster.notification_service.model.enums.NotificationStatus;
import nl.saxion.disaster.notification_service.model.enums.NotificationType;
import nl.saxion.disaster.notification_service.repository.contract.NotificationRepository;
import nl.saxion.disaster.shared.event.IncidentEvent;
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

    private final RegionClient regionClient;
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

        //Send notification to region-service
        try {
            IncidentNotificationDto dto = new IncidentNotificationDto(
                notification.getId(), // notificationId
                notification.getIncidentId(),
                notification.getRegionId(),
                "New Incident - " + notification.getTitle(), // title
                notification.getDescription(), // description
                notification.getNotificationType(),
                notification.getCreatedAt(),
                notification.isRead()
            );
            regionClient.sendIncidentNotification(dto);
            log.info("sent notification to region-service for incidentId={}", event.incidentId());
        } catch (Exception e) {
            log.error("Failed to send notification to region-service for incidentId={} → {}", event.incidentId(), e.getMessage());
        }
    }
}