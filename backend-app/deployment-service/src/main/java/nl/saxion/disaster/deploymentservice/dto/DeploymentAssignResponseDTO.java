package nl.saxion.disaster.deploymentservice.dto;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class DeploymentAssignResponseDTO {

    private Long requestId;

    // Status of the overall DeploymentRequest
    private String requestStatus;

    // Approver + approval timestamp for the entire request
    private Long requestAssignedBy;
    private Date requestAssignedAt;

    private String notes;

    private String statusMessage;

    // List of generated deployments with their own status/timestamps
    private List<DeploymentSummaryDTO> deployments;
}
