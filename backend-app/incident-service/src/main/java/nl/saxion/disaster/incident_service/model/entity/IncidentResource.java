package nl.saxion.disaster.incident_service.model.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a resource that has been allocated to a specific incident.
 * <p>
 * This entity acts as a join table between the Incident entity and
 * resources managed in the resource-service. It stores the IDs and
 * quantities of allocated resources so that the incident-service
 * can track which resources belong to each incident.
 * </p>
 */
@Entity
@Table(name = "incident_resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentResource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_id", nullable = false)
    private Long incidentId;

    @Column(name = "resource_id", nullable = false)
    private Long resourceId;

    @Column(nullable = false)
    private Integer quantity;
}
