package nl.saxion.disaster.notification_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import nl.saxion.disaster.notification_service.service.contract.IncidentNotificationService;
import nl.saxion.disaster.notification_service.service.JwtTokenService;
import org.springframework.security.oauth2.jwt.Jwt;

@Tag(name = "Incident Notification", description = "Handles real-time incident notifications for all incidents.")
@Slf4j
@RestController
@RequestMapping("/api/notifications/incidents")
public class IncidentNotificationController {
    private final IncidentNotificationService incidentNotificationService;
    private final JwtTokenService jwtTokenService;

    public IncidentNotificationController(IncidentNotificationService incidentNotificationService, JwtTokenService jwtTokenService) {
        this.incidentNotificationService = incidentNotificationService;
        this.jwtTokenService = jwtTokenService;
    }

    @Operation(
            summary = "Open SSE stream for incidents",
            description = "Opens a Server-Sent Events connection for live incident notifications for all incidents."
    )
    @GetMapping("/stream/{regionId}")
    public SseEmitter streamNotifications(
            @PathVariable String regionId,
            @RequestParam(value = "lastNotificationId", required = false) Long lastNotificationId,
            @RequestParam String token) {
        Jwt jwt = jwtTokenService.decodeAndValidate(token);
        String keycloakSub = jwt.getSubject();
        // Optionally extract roles or other claims if needed
        // List<String> roles = jwt.getClaimAsStringList("roles");
        log.info("SSE subscription request for user {} in region {}", keycloakSub, regionId);
        SseEmitter emitter = incidentNotificationService.addEmitter(regionId);
        incidentNotificationService.sendMissedNotifications(emitter, regionId, lastNotificationId);
        return emitter;
    }
}
