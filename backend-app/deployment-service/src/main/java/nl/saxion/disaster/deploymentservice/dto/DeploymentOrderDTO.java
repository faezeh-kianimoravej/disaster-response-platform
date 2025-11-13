package nl.saxion.disaster.deploymentservice.dto;

import lombok.Data;
import nl.saxion.disaster.deploymentservice.enums.IncidentSeverity;

import java.util.Date;
import java.util.List;

@Data
public class DeploymentOrderDTO {

    private Long deploymentOrderId;
    private Long incidentId;
    private Long orderedBy;
    private Date orderedAt;

    private List<DeploymentRequestDTO> deploymentRequests;
    private IncidentSeverity incidentSeverity;
    private String notes;
}
