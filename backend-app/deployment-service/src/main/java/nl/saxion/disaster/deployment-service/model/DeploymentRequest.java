package nl.saxion.disaster.deploymentservice.model;

import jakarta.persistence.*;
import lombok.Data;

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

    @Column(nullable = false)
    private String priority;

    @Column(nullable = false)
    private String requestedUnitType;

    @Column(nullable = false)
    private int requestedQuantity;

    private Long assignedUnitId;
    private Long assignedBy;
    private Date assignedAt;

    @Column(nullable = false)
    private String status;

    private String notes;
}