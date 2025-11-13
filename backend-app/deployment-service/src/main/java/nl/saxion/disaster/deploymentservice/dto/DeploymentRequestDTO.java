package nl.saxion.disaster.deploymentservice.dto;

import lombok.Data;
import nl.saxion.disaster.deploymentservice.enums.DeploymentRequestStatus;
import nl.saxion.disaster.deploymentservice.enums.IncidentSeverity;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;

import java.util.Date;

@Data
public class DeploymentRequestDTO {

    private Long requestId;
    private Long incidentId;
    private Long deploymentOrderId;
    private Long requestedBy;
    private Date requestedAt;

    private Long targetDepartmentId;
    private IncidentSeverity priority;
    private ResponseUnitType requestedUnitType;
    private int requestedQuantity;

    private Long assignedUnitId;
    private Long assignedBy;
    private Date assignedAt;

    private DeploymentRequestStatus status;
    private String notes;
}
