package nl.saxion.disaster.notification_service.service.contract;

import nl.saxion.disaster.notification_service.dto.DeploymentNotificationDto;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface DeploymentNotificationService {

    /**
     * Register a new SSE emitter for a given department.
     */
    SseEmitter addEmitter(String departmentId);

    /**
     * Send missed notifications to a newly connected emitter,
     * starting after the given lastNotificationId (if any).
     */
    void sendMissedDeploymentNotifications(SseEmitter emitter, String departmentId, Long lastNotificationId);

    void broadcastDeploymentNotification(DeploymentNotificationDto dto);
}
