package nl.saxion.disaster.notification_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import nl.saxion.disaster.notification_service.service.contract.IncidentNotificationService;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.Map;

@Tag(name = "Incident Notification", description = "Handles real-time incident notifications for all incidents.")
@Slf4j
@RestController
@RequestMapping("/api/notifications/incidents")
@CrossOrigin(origins = "*")
public class IncidentNotificationController {
    private final IncidentNotificationService incidentNotificationService;

    public IncidentNotificationController(IncidentNotificationService incidentNotificationService) {
        this.incidentNotificationService = incidentNotificationService;
    }

    @Operation(
            summary = "Open SSE stream for incidents",
            description = "Opens a Server-Sent Events connection for live incident notifications for all incidents."
    )
    @GetMapping("/stream/{regionId}")
    public SseEmitter streamNotifications(
            @PathVariable String regionId,
            @RequestParam(value = "lastNotificationId", required = false) Long lastNotificationId
    ) {
        SseEmitter emitter = incidentNotificationService.addEmitter(regionId);
        incidentNotificationService.sendMissedNotifications(emitter, regionId, lastNotificationId);
        return emitter;
    }
}
