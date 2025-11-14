package nl.saxion.disaster.notification_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.notification_service.model.entity.Notification;
import nl.saxion.disaster.notification_service.model.enums.NotificationType;
import nl.saxion.disaster.notification_service.repository.contract.NotificationRepository;
import nl.saxion.disaster.notification_service.service.contract.DeploymentNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeploymentNotificationServiceImpl implements DeploymentNotificationService {

    private final NotificationRepository notificationRepository;

    // departmentId -> SSE emitter
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();


    /**
     * Implementation of the interface method with the same signature.
     */
    @Override
    public void sendDeploymentNotification(Long departmentId,
                                           Long requestId,
                                           Long incidentId,
                                           Instant createdAt) {

        log.info("Creating & sending deployment notification to department {}, for request {}",
                departmentId, requestId);

        // 1) Create object
        Notification notification = Notification.builder()
                .departmentId(departmentId)
                .incidentId(incidentId)
                .notificationType(NotificationType.DEPLOYMENT_REQUEST)
                .title("New deployment request")
                .description("A new deployment request (" + requestId + ") has been created")
                .createdAt(OffsetDateTime.ofInstant(createdAt, ZoneOffset.UTC))
                .read(false)
                .build();

        // 2) Save in DB
        Notification saved = notificationRepository.createNotification(notification);

        // 3) Push via SSE
        sendSseToDepartment(departmentId, saved);
    }


    @Override
    public SseEmitter connectStream(Long departmentId) {
        SseEmitter emitter = new SseEmitter(0L);

        emitters.put(departmentId, emitter);

        emitter.onCompletion(() -> emitters.remove(departmentId));
        emitter.onTimeout(() -> emitters.remove(departmentId));
        emitter.onError(e -> emitters.remove(departmentId));

        log.info("SSE connection opened for department {}", departmentId);

        return emitter;
    }


    /**
     * Push notification to the connected SSE client.
     */
    private void sendSseToDepartment(Long departmentId, Notification notification) {
        SseEmitter emitter = emitters.get(departmentId);

        if (emitter == null) {
            log.warn("No SSE emitter found for department {}", departmentId);
            return;
        }

        try {
            emitter.send(
                    SseEmitter.event()
                            .name("deployment-notification")
                            .data(notification)
            );
            log.info("Sent deployment SSE notification to department {}", departmentId);

        } catch (IOException e) {
            emitters.remove(departmentId);
            log.error("Failed to send SSE notification to department {}", departmentId, e);
        }
    }
}
