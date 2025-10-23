package nl.saxion.disaster.regionservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.regionservice.dto.IncidentNotificationDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@Tag(name = "Notification Receiver",
        description = "Handles real-time incident notifications for regions.")
@Slf4j
@RestController
@RequestMapping("/api/regions/incidents")
@CrossOrigin(origins = "*")
public class NotificationReceiverController {

    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    @Operation(
            summary = "Open SSE stream",
            description = "Opens a Server-Sent Events connection for live incident notifications."
    )
    @GetMapping("/stream")
    public SseEmitter streamNotifications() {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
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
                emitter.send(SseEmitter.event().name("incident").data(dto));
            } catch (IOException e) {
                emitters.remove(emitter);
            }
        }
        log.info("Broadcasted to {} clients", emitters.size());
    }
}
