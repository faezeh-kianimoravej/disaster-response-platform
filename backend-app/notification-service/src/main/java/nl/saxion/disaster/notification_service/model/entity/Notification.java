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
    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;
    private String title;
    private String description;
    private OffsetDateTime createdAt;
    private boolean read;
}

