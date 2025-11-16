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
@Tag(name = "Notifications", description = "Endpoints for incident & deployment notifications")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // ------------------------------- COMMON -----------------------------------

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long id) {
        boolean updated = notificationService.markNotificationAsRead(id);
        return updated ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    // ------------------------------- INCIDENTS -----------------------------------

    @GetMapping("/incident")
    public ResponseEntity<List<IncidentNotificationDto>> getIncidentNotifications(
            @RequestParam Long regionId
    ) {
        log.info("Get incident notifications for region {}", regionId);
        return ResponseEntity.ok(notificationService.getNotificationsByRegionId(regionId));
    }

    @GetMapping("/incident/{id}")
    public ResponseEntity<IncidentNotificationDto> getIncidentNotificationById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    @GetMapping("/incident/type/{type}")
    public ResponseEntity<List<IncidentNotificationDto>> getIncidentNotificationsByType(
            @PathVariable String type
    ) {
        return ResponseEntity.ok(notificationService.getNotificationsByType(type));
    }

    // ------------------------------- DEPLOYMENTS -----------------------------------

    @GetMapping("/deployment")
    public ResponseEntity<List<DeploymentNotificationDto>> getDeploymentNotifications(
            @RequestParam Long departmentId
    ) {
        log.info("Get deployment notifications for department {}", departmentId);
        return ResponseEntity.ok(notificationService.getNotificationsByDepartmentId(departmentId));
    }

    @GetMapping("/deployment/{id}")
    public ResponseEntity<DeploymentNotificationDto> getDeploymentNotificationById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(notificationService.getDeploymentNotificationById(id));
    }

}
