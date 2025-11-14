package nl.saxion.disaster.deploymentservice.model;

import jakarta.persistence.*;
import lombok.Data;
import nl.saxion.disaster.deploymentservice.enums.DeploymentRequestStatus;
import nl.saxion.disaster.deploymentservice.enums.IncidentSeverity;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;

import java.util.Date;

@Entity
@Table(name = "deployment_requests")
@Data
public class DeploymentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @Column(nullable = false)
    private Long incidentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deployment_order_id", nullable = false)
    private DeploymentOrder deploymentOrder;

    @Column(nullable = false)
    private Long requestedBy;

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date requestedAt;

    @Column(nullable = false)
    private Long targetDepartmentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentSeverity priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResponseUnitType requestedUnitType;

    @Column(nullable = false)
    private int requestedQuantity;

    private Long assignedUnitId;
    private Long assignedBy;
    private Date assignedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeploymentRequestStatus status;

    private String notes;
}