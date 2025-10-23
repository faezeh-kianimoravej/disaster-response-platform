package nl.saxion.disaster.notification_service.service;

import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;
import nl.saxion.disaster.notification_service.service.contract.IncidentNotificationService;
import nl.saxion.disaster.notification_service.service.contract.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Slf4j
@Service
public class IncidentNotificationServiceImpl implements IncidentNotificationService {
    // Map regionId -> list of emitters
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> regionEmitters = new ConcurrentHashMap<>();
    private final NotificationService notificationService;

    public IncidentNotificationServiceImpl(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Override
    public SseEmitter addEmitter(String regionId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        regionEmitters.computeIfAbsent(regionId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        log.info("New SSE client connected for region {} ({} active)", regionId, regionEmitters.get(regionId).size());
        emitter.onCompletion(() -> regionEmitters.getOrDefault(regionId, new CopyOnWriteArrayList<>()).remove(emitter));
        emitter.onTimeout(() -> regionEmitters.getOrDefault(regionId, new CopyOnWriteArrayList<>()).remove(emitter));
        return emitter;
    }

    @Override
    public void sendMissedNotifications(SseEmitter emitter, String regionId, String lastEventIdHeader) {
        if (lastEventIdHeader != null) {
            try {
                Long lastEventId = Long.parseLong(lastEventIdHeader);
                List<IncidentNotificationDto> missed = notificationService.getNotificationsAfterId(lastEventId);
                for (IncidentNotificationDto dto : missed) {
                    if (regionId.equals(dto.regionId() != null ? dto.regionId().toString() : null)) {
                        emitter.send(SseEmitter.event()
                                .id(dto.notificationId() != null ? dto.notificationId().toString() : null)
                                .name("notification")
                                .data(dto));
                    }
                }
                log.info("Sent {} missed notifications to reconnecting client for region {}", missed.size(), regionId);
            } catch (Exception e) {
                log.warn("Failed to recover missed notifications: {}", e.getMessage());
            }
        }
    }

    @Override
    public void broadcastIncidentNotification(IncidentNotificationDto dto) {
        Long regionId = dto.regionId();
        if (regionId == null) {
            log.warn("Notification does not have a regionId, skipping broadcast.");
            return;
        }
        List<SseEmitter> emitters = regionEmitters.getOrDefault(regionId.toString(), new CopyOnWriteArrayList<>());
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
        log.info("Broadcasted to {} clients for region {}", emitters.size(), regionId);
    }
}
