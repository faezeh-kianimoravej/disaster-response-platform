package nl.saxion.disaster.notification_service.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import nl.saxion.disaster.notification_service.model.enums.NotificationStatus;
import nl.saxion.disaster.notification_service.model.enums.NotificationType;
import org.springframework.data.annotation.Id;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long incidentId;
    private Long regionId;
    private String incidentType;
    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;
    @Enumerated(EnumType.STRING)
    private NotificationStatus notificationStatus;
    private String message;
    private String severity;
    private String location;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime reportedAt;
    private LocalDateTime deliveredAt;
}

