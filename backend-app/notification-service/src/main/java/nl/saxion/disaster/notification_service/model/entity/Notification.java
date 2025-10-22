package nl.saxion.disaster.notification_service.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import nl.saxion.disaster.notification_service.model.enums.NotificationStatus;
import nl.saxion.disaster.notification_service.model.enums.NotificationType;

import java.time.OffsetDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
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
    private OffsetDateTime createdAt;
    private OffsetDateTime reportedAt;
    private OffsetDateTime deliveredAt;
}

