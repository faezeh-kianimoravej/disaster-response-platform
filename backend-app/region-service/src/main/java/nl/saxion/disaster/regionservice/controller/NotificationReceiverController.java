package nl.saxion.disaster.regionservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.regionservice.dto.IncidentNotificationDto;
import jakarta.servlet.http.HttpServletRequest;
import nl.saxion.disaster.regionservice.client.NotificationClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Tag(name = "Notification Receiver",
        description = "Handles real-time incident notifications for regions.")
@Slf4j
@RestController
@RequestMapping("/api/regions/incidents")
@CrossOrigin(origins = "*")
public class NotificationReceiverController {
    private final NotificationClient notificationClient;
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public NotificationReceiverController(NotificationClient notificationClient) {
        this.notificationClient = notificationClient;
    }

    @Operation(
            summary = "Open SSE stream",
            description = "Opens a Server-Sent Events connection for live incident notifications."
    )
    @GetMapping("/stream")
    public SseEmitter streamNotifications(HttpServletRequest request) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        // Missed event recovery: check Last-Event-ID header
        String lastEventIdHeader = request.getHeader("Last-Event-ID");
        if (lastEventIdHeader != null) {
            try {
                Long lastEventId = Long.parseLong(lastEventIdHeader);
                List<IncidentNotificationDto> missed = notificationClient.getNotificationsAfter(lastEventId);
                for (IncidentNotificationDto dto : missed) {
                    emitter.send(SseEmitter.event()
                        .id(dto.notificationId() != null ? dto.notificationId().toString() : null)
                        .name("notification")
                        .data(dto));
                }
                log.info("Sent {} missed notifications to reconnecting client", missed.size());
            } catch (Exception e) {
                log.warn("Failed to recover missed notifications: {}", e.getMessage());
            }
        }

        emitters.add(emitter);
        log.info("New SSE client connected ({} active)", emitters.size());
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));
        return emitter;
    }

    @Operation(
            summary = "Receive new incident notification",
            description = "Called by the notification-service to broadcast new incident updates to connected clients."
    )
    @PostMapping("/notify")
    public ResponseEntity<Void> receiveNotification(@RequestBody IncidentNotificationDto dto) {
        log.info("[REGION-SERVICE] New incident notification: {}", dto);
        sendNotificationToClients(dto);
        return ResponseEntity.ok().build();
    }

    private void sendNotificationToClients(IncidentNotificationDto dto) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                    .id(dto.notificationId() != null ? dto.notificationId().toString() : null)
                    .name("notification")
                    .data(dto));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
        log.info("Broadcasted to {} clients", emitters.size());
    }
}
