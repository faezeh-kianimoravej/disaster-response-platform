package nl.saxion.disaster.deploymentservice.dto;

import lombok.Data;

import java.util.Date;

@Data
public class DeploymentRequestDTO {

    private Long requestId;
    private Long incidentId;
    private Long deploymentOrderId;
    private Long requestedBy;
    private Date requestedAt;

    private Long targetDepartmentId;
    private String priority;
    private String requestedUnitType;
    private int requestedQuantity;

    private Long assignedUnitId;
    private Long assignedBy;
    private Date assignedAt;

    private String status;
    private String notes;
}
