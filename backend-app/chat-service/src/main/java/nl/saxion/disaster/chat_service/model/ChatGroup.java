package nl.saxion.disaster.chat_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "chat_groups", uniqueConstraints = {
    @UniqueConstraint(name = "uk_chat_group_incident", columnNames = "incident_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "chat_group_id")
    private Long chatGroupId;

    @Column(name = "incident_id", nullable = false)
    private Long incidentId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "is_closed", nullable = false)
    @Builder.Default
    private Boolean isClosed = false;

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        if (this.isClosed == null) {
            this.isClosed = false;
        }
    }
}
