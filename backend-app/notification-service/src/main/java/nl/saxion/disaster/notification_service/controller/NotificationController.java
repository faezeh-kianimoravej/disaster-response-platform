package nl.saxion.disaster.notification_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;
import nl.saxion.disaster.notification_service.service.contract.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/notifications
     * → returns all notifications
     */
    @GetMapping
    public ResponseEntity<List<IncidentNotificationDto>> getAllNotifications() {
        log.info("Get Request to fetch all notifications");
        List<IncidentNotificationDto> notifications = notificationService.getAllNotifications();
        return ResponseEntity.ok(notifications);
    }

    /**
     * GET /api/notifications/{id}
     * → returns a specific notification by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<IncidentNotificationDto> getNotificationById(@PathVariable Long id) {
        log.info("🔍 [GET] Request to fetch notification by ID {}", id);
        IncidentNotificationDto dto = notificationService.getNotificationById(id);
        if (dto == null) {
            log.warn("Notification with ID {} not found", id);
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    /**
     * GET /api/notifications/type/{type}
     * → returns notifications filtered by type
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<IncidentNotificationDto>> getNotificationsByType(@PathVariable String type) {
        log.info("Get Request to fetch notifications by type '{}'", type);
        List<IncidentNotificationDto> notifications = notificationService.getNotificationsByType(type);
        return ResponseEntity.ok(notifications);
    }
}
