package nl.saxion.disaster.deploymentservice.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "deployments")
@Data
public class Deployment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deploymentId;

    @Column(nullable = false)
    private Long incidentId;

    @Column(nullable = false)
    private Long deploymentRequestId;

    @Column(nullable = false)
    private Long responseUnitId;

    @Column(nullable = false)
    private String status;

    @ElementCollection
    @CollectionTable(name = "deployment_deployed_resources", joinColumns = @JoinColumn(name = "deployment_id"))
    private List<DeployedResource> deployedResources;

    @ElementCollection
    @CollectionTable(name = "deployment_deployed_personnel", joinColumns = @JoinColumn(name = "deployment_id"))
    private List<DeployedPersonnel> deployedPersonnel;

    @Column(nullable = false)
    private LocalDateTime orderedAt;

    @Column(nullable = false)
    private LocalDateTime assignedAt;

    private LocalDateTime acknowledgedAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime arrivedAt;
    private LocalDateTime completedAt;

    private Double currentLatitude;
    private Double currentLongitude;
    private LocalDateTime estimatedArrival;

    @ElementCollection
    @CollectionTable(name = "deployment_consumed_resources", joinColumns = @JoinColumn(name = "deployment_id"))
    private List<ConsumedResource> consumedResources;

    private String notes;

    @Embeddable
    @Data
    public static class DeployedResource {
        @Column(nullable = false)
        private Long resourceId;

        @Column(nullable = false)
        private Integer quantity;
    }

    @Embeddable
    @Data
    public static class DeployedPersonnel {
        @Column(nullable = false)
        private Long userId;

        @Column(nullable = false, length = 80)
        private String specialization;
    }

    @Embeddable
    @Data
    public static class ConsumedResource {
        @Column(nullable = false)
        private Long resourceId;

        @Column(nullable = false)
        private Integer quantityUsed;
    }
}
