package nl.saxion.disaster.notification_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import nl.saxion.disaster.notification_service.service.contract.IncidentNotificationService;

@Tag(name = "Incident Notification", description = "Handles real-time incident notifications for all incidents.")
@Slf4j
@RestController
@RequestMapping("/api/notifications/incidents")
public class IncidentNotificationController {
    private final IncidentNotificationService incidentNotificationService;

    public IncidentNotificationController(IncidentNotificationService incidentNotificationService) {
        this.incidentNotificationService = incidentNotificationService;
    }

    @Operation(
            summary = "Open SSE stream for incidents",
            description = "Opens a Server-Sent Events connection for live incident notifications for all incidents."
    )
    @GetMapping(value = "/stream/{regionId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(
            @PathVariable String regionId,
            @RequestParam(value = "lastNotificationId", required = false) Long lastNotificationId,
            @AuthenticationPrincipal Jwt jwt) {
        String keycloakSub = jwt.getSubject();
        log.info("SSE subscription request for user {} in region {}", keycloakSub, regionId);
        SseEmitter emitter = incidentNotificationService.addEmitter(regionId);
        incidentNotificationService.sendMissedNotifications(emitter, regionId, lastNotificationId);
        return emitter;
    }
}
