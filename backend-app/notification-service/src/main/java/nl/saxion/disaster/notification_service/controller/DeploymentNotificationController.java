package nl.saxion.disaster.notification_service.controller;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.notification_service.service.contract.DeploymentNotificationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/notifications/deployment")
@RequiredArgsConstructor
public class DeploymentNotificationController {

    private final DeploymentNotificationService notificationService;

    /**
     * SSE endpoint for deployment-related real-time notifications.
     * Clients (e.g., department officers) connect here to receive
     * new deployment request notifications instantly.
     */
    @GetMapping("/stream/{departmentId}")
    public SseEmitter streamDeploymentNotifications(@PathVariable Long departmentId) {
        return notificationService.connectStream(departmentId);
    }
}
