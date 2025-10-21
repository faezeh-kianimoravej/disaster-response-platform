package nl.saxion.disaster.regionservice.controller;

import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.regionservice.dto.IncidentNotificationDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/regions/incidents")
public class NotificationReceiverController {

    /**
     * POST /api/regions/incidents/notify
     * → called by notification-service
     * → directly returns the same notification to frontend
     */
    @PostMapping("/notify")
    public ResponseEntity<IncidentNotificationDto> receiveNotification(@RequestBody IncidentNotificationDto dto) {
        log.info("[REGION-SERVICE] Received notification: {}", dto);
        return ResponseEntity.ok(dto);
    }
}
