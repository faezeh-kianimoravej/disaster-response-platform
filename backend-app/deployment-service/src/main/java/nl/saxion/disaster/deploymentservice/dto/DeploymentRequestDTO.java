package nl.saxion.disaster.deploymentservice.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import nl.saxion.disaster.deploymentservice.enums.DeploymentRequestStatus;
import nl.saxion.disaster.deploymentservice.enums.IncidentSeverity;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;

import java.util.Date;

@Data
public class DeploymentRequestDTO {

    @JsonSerialize(using = ToStringSerializer.class)
    private Long requestId;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long incidentId;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long deploymentOrderId;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long requestedBy;
    private Date requestedAt;

    @JsonSerialize(using = ToStringSerializer.class)
    private Long targetDepartmentId;
    private IncidentSeverity priority;
    private ResponseUnitType requestedUnitType;
    private int requestedQuantity;

    @JsonSerialize(using = ToStringSerializer.class)
    private Long assignedUnitId;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long assignedBy;
    private Date assignedAt;

    private DeploymentRequestStatus status;
    private String notes;
}
