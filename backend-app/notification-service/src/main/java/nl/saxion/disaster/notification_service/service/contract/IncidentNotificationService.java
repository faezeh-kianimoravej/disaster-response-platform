package nl.saxion.disaster.notification_service.service.contract;

import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface IncidentNotificationService {
    SseEmitter addEmitter(String regionId);
    void sendMissedNotifications(SseEmitter emitter, String regionId, Long lastNotificationId);
    void broadcastIncidentNotification(IncidentNotificationDto dto);
}
