package nl.saxion.disaster.deploymentservice.dto;

import lombok.Data;
import nl.saxion.disaster.deploymentservice.enums.DeploymentStatus;
import nl.saxion.disaster.deploymentservice.enums.ResponderSpecialization;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DeploymentDTO {

    private Long deploymentId;
    private Long incidentId;
    private Long deploymentRequestId;
    private Long responseUnitId;
    private DeploymentStatus status;

    private List<DeployedResourceDTO> deployedResources;
    private List<DeployedPersonnelDTO> deployedPersonnel;

    private LocalDateTime orderedAt;
    private LocalDateTime assignedAt;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime dispatchedAt;
    private LocalDateTime arrivedAt;
    private LocalDateTime completedAt;

    private Double currentLatitude;
    private Double currentLongitude;
    private LocalDateTime estimatedArrival;

    private List<ConsumedResourceDTO> consumedResources;
    private String notes;

    @Data
    public static class DeployedResourceDTO {
        private Long resourceId;
        private int quantity;
    }

    @Data
    public static class DeployedPersonnelDTO {
        private Long userId;
        private ResponderSpecialization specialization;
    }

    @Data
    public static class ConsumedResourceDTO {
        private Long resourceId;
        private int quantityUsed;
    }
}
