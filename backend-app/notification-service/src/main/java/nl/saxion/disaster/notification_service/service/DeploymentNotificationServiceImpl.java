package nl.saxion.disaster.notification_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.notification_service.dto.DeploymentNotificationDto;
import nl.saxion.disaster.notification_service.service.contract.DeploymentNotificationService;
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
@RequiredArgsConstructor
public class DeploymentNotificationServiceImpl implements DeploymentNotificationService {

    private final Map<String, CopyOnWriteArrayList<SseEmitter>> departmentEmitters = new ConcurrentHashMap<>();
    private final NotificationService notificationService;

    @Override
    public SseEmitter addEmitter(String departmentId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        departmentEmitters.computeIfAbsent(departmentId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        log.info("New SSE client connected for department {} ({} active)", departmentId, departmentEmitters.get(departmentId).size());
        emitter.onCompletion(() -> departmentEmitters.getOrDefault(departmentId, new CopyOnWriteArrayList<>()).remove(emitter));
        emitter.onTimeout(() -> departmentEmitters.getOrDefault(departmentId, new CopyOnWriteArrayList<>()).remove(emitter));
        return emitter;
    }

    @Override
    public void sendMissedDeploymentNotifications(SseEmitter emitter, String departmentId, Long lastNotificationId) {
        if (lastNotificationId != null) {
            try {
                List<DeploymentNotificationDto> missed = notificationService.getDepartmentNotificationsAfterId(lastNotificationId);
                for (DeploymentNotificationDto dto : missed) {
                    if (dto.departmentId() != null && dto.departmentId().toString().equals(departmentId)) {
                        emitter.send(SseEmitter.event()
                                .id(dto.notificationId() != null ? dto.notificationId().toString() : null)
                                .name("notification")
                                .data(dto));
                    }
                }
                log.info("Sent {} missed notifications to reconnecting client for department {}", missed.size(), departmentId);
            } catch (Exception e) {
                log.warn("Failed to recover missed notifications: {}", e.getMessage());
            }
        }
    }


    @Override
    public void broadcastDeploymentNotification(DeploymentNotificationDto dto) {
        Long departmentId = dto.departmentId();
        if (departmentId == null) {
            log.warn("Notification does not have a departmentId, skipping broadcast.");
            return;
        }
        List<SseEmitter> emitters = departmentEmitters.getOrDefault(departmentId.toString(), new CopyOnWriteArrayList<>());
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
        log.info("Broadcasted to {} clients for department {}", emitters.size(), departmentId);
    }
}
