package nl.saxion.disaster.notification_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.notification_service.dto.DeploymentNotificationDto;
import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;
import nl.saxion.disaster.notification_service.service.contract.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(name = "Notifications", description = "Endpoints for querying incident notifications")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(
            summary = "Mark notification as read",
            description = "Marks a notification as read by its ID.",
            tags = {"Notifications"}
    )
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long id) {
        boolean updated = notificationService.markNotificationAsRead(id);
        if (updated) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @Operation(
            summary = "Get all notifications",
            description = "Returns all notifications stored in the system.",
            tags = {"Notifications"}
    )
    @GetMapping
    public ResponseEntity<List<IncidentNotificationDto>> getAllNotifications(@RequestParam(value = "regionId") Long regionId) {
        log.info("Get Request to fetch all notifications for regionId={}", regionId);
        List<IncidentNotificationDto> notifications = notificationService.getNotificationsByRegionId(regionId);
        return ResponseEntity.ok(notifications);
    }

    @Operation(
            summary = "Get notification by ID",
            description = "Returns a specific notification by its unique ID.",
            tags = {"Notifications"}
    )
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

    @Operation(
            summary = "Get notifications by type",
            description = "Returns all notifications filtered by the given type.",
            tags = {"Notifications"}
    )
    @GetMapping("/type/{type}")
    public ResponseEntity<List<IncidentNotificationDto>> getNotificationsByType(@PathVariable String type) {
        log.info("Get Request to fetch notifications by type '{}'", type);
        List<IncidentNotificationDto> notifications = notificationService.getNotificationsByType(type);
        return ResponseEntity.ok(notifications);
    }

    @Operation(
            summary = "Get notification by departmentId",
            description = "Returns a specific notification by departmentId.",
            tags = {"Notifications"}
    )
    @GetMapping("/{departmentId}")
    public ResponseEntity<List<DeploymentNotificationDto>> getNotificationByDepartmentId(@PathVariable Long departmentId) {
        log.info("🔍 [GET] Request to fetch notification by department ID {}", departmentId);
        List<DeploymentNotificationDto> notificationDos = notificationService.getNotificationsByDepartmentId(departmentId);
        if (notificationDos == null) {
            log.warn("Notification with department ID {} not found", departmentId);
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(notificationDos);
    }
}
