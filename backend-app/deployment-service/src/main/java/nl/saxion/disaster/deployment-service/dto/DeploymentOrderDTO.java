package nl.saxion.disaster.deploymentservice.dto;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class DeploymentOrderDTO {

    private Long deploymentOrderId;
    private Long incidentId;
    private Long orderedBy;
    private Date orderedAt;

    private List<DeploymentRequestDTO> deploymentRequests;
    private String incidentSeverity;
    private int gripLevel;
    private String instructions;
}
