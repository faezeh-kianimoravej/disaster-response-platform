package nl.saxion.disaster.deploymentservice.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DeploymentSummaryDTO {

    private Long deploymentId;
    private Long responseUnitId;

    // Status of this individual deployment (ASSIGNED, ACKNOWLEDGED, ...)
    private String deploymentStatus;

    // When this specific unit was assigned
    private LocalDateTime deploymentAssignedAt;
}
