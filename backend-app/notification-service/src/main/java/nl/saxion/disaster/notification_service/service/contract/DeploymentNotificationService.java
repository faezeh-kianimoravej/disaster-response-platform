package nl.saxion.disaster.notification_service.service.contract;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Instant;

public interface DeploymentNotificationService {


    /**
     * Creates and stores a deployment notification in the database,
     * and sends it in real-time to the department via SSE.
     */
    void sendDeploymentNotification(Long departmentId, Long requestId, Long incidentId, Instant createdAt);

    /**
     * Opens an SSE connection for the given department.
     * This is used by frontend to receive real-time deployment notifications.
     */
    SseEmitter connectStream(Long departmentId);

}
