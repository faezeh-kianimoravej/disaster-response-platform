package nl.saxion.disaster.deploymentservice.model;

import jakarta.persistence.*;
import lombok.Data;
import nl.saxion.disaster.deploymentservice.enums.IncidentSeverity;

import java.util.Date;
import java.util.List;

@Entity
@Table(name = "deployment_orders")
@Data
public class DeploymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deploymentOrderId;

    @Column(nullable = false)
    private Long incidentId;

    @Column(nullable = false)
    private Long orderedBy;

    @Column(nullable = false)
    private Date orderedAt;

    @OneToMany(mappedBy = "deploymentOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DeploymentRequest> deploymentRequests;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentSeverity incidentSeverity;

    private String notes;
}