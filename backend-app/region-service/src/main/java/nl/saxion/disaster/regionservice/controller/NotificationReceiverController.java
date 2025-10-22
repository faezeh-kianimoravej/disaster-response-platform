package nl.saxion.disaster.regionservice.controller;

import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.regionservice.dto.IncidentNotificationDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@RestController
@RequestMapping("/api/regions/incidents")
public class NotificationReceiverController {

    // Thread-safe list of all active frontend connections (SSE clients)
    private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    /**
     * GET /api/regions/incidents/stream
     * ------------------------------------------------------------
     * This endpoint establishes a real-time one-way connection
     * from the server to the frontend using Server-Sent Events (SSE).
     * Each connected frontend receives live notifications
     * whenever a new incident is reported.
     */
    @GetMapping("/stream")
    public SseEmitter streamNotifications() {
        // Create a new emitter for the client connection
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);

        // Register the new emitter
        emitters.add(emitter);
        log.info("🌐 New SSE client connected ({} active)", emitters.size());

        // Remove emitter on connection close or timeout
        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> emitters.remove(emitter));

        // Keep the connection open
        return emitter;
    }

    /**
     * POST /api/regions/incidents/notify
     * ------------------------------------------------------------
     * Called by the notification-service via Feign client
     * whenever a new incident notification arrives.
     * This method broadcasts the notification to all connected
     * frontend clients in real-time.
     */
    @PostMapping("/notify")
    public ResponseEntity<Void> receiveNotification(@RequestBody IncidentNotificationDto dto) {
        log.info("[REGION-SERVICE] Received new incident notification: {}", dto);

        // Broadcast to all connected frontend clients
        sendNotificationToClients(dto);

        // Return 200 OK to the notification-service
        return ResponseEntity.ok().build();
    }

    /**
     * Sends the given notification to all active SSE clients.
     */
    private void sendNotificationToClients(IncidentNotificationDto dto) {
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("incident")   // Event name used on the frontend
                        .data(dto));        // Actual JSON data sent to the client
            } catch (IOException e) {
                // Remove disconnected or failed clients
                emitters.remove(emitter);
            }
        }

        log.info("Broadcasted incident notification to {} connected clients", emitters.size());
    }
}
