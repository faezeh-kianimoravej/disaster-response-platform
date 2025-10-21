package nl.saxion.disaster.notification_service.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.notification_service.client.RegionClient;
import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;
import nl.saxion.disaster.notification_service.event.IncidentEvent;
import nl.saxion.disaster.notification_service.model.entity.Notification;
import nl.saxion.disaster.notification_service.model.enums.NotificationStatus;
import nl.saxion.disaster.notification_service.model.enums.NotificationType;
import nl.saxion.disaster.notification_service.repository.contract.NotificationRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Listens to incident events from Kafka, creates notifications,
 * stores them in the database, and sends them to region-service via Feign.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class IncidentListener {

    private final RegionClient regionClient;
    private final NotificationRepository notificationRepository;

    @KafkaListener(topics = "incidents", groupId = "notification-group")
    public void handleIncident(IncidentEvent event) {
        log.info(" Received Incident Event from Kafka: {}", event.incidentId());

        Notification notification = new Notification();
        try {

            notification.setIncidentId(event.incidentId());
            notification.setRegionId(event.regionId());
            notification.setIncidentType(event.incidentType());
            notification.setNotificationType(NotificationType.NEW_INCIDENT);
            notification.setMessage("New " + event.incidentType() + " incident reported: " + event.description());
            notification.setSeverity(event.severity());
            notification.setLocation(event.location());
            notification.setNotificationStatus(NotificationStatus.CREATED);
            notification.setCreatedBy(event.createdBy());
            notification.setCreatedAt(event.createdAt());
            notification.setReportedAt(event.reportTime());

            notificationRepository.createNotification(notification);
            log.info("Notification saved for incident ID: {}", event.incidentId());

            sendNewIncidentNotificationToRegion(event, notification);

        } catch (Exception e) {
            log.error("Failed to process incident event {}: {}", event.incidentId(), e.getMessage(), e);
        }
    }

    /**
     * Sends notification to region-service via Feign client
     * and updates delivery status.
     */
    private void sendNewIncidentNotificationToRegion(IncidentEvent event, Notification notification) {
        try {
            IncidentNotificationDto dto = new IncidentNotificationDto(
                    notification.getId(),
                    event.incidentId(),
                    notification.getRegionId(),
                    event.incidentType(),
                    NotificationType.NEW_INCIDENT,
                    notification.getNotificationStatus(),
                    notification.getMessage(),
                    event.severity(),
                    event.location(),
                    event.createdBy(),
                    event.createdAt(),
                    event.reportTime(),
                    notification.getDeliveredAt()
            );

            regionClient.sendIncidentNotification(dto);
            log.info("Notification sent to region-service for regionId={}", event.regionId());

            notification.setNotificationStatus(NotificationStatus.DELIVERED);
            notification.setDeliveredAt(LocalDateTime.now());
            notificationRepository.updateNotificationStatus(notification);

            log.info("Notification {} delivered successfully at {}",
                    notification.getId(), notification.getDeliveredAt());

        } catch (Exception e) {
            notification.setNotificationStatus(NotificationStatus.FAILED);
            notification.setDeliveredAt(null);
            notificationRepository.updateNotificationStatus(notification);

            log.warn("Failed to deliver notification {} to region {} → {}",
                    notification.getId(), notification.getRegionId(), e.getMessage());
        }
    }
}
