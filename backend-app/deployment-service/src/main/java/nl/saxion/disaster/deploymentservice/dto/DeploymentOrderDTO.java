package nl.saxion.disaster.deploymentservice.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import nl.saxion.disaster.deploymentservice.enums.IncidentSeverity;

import java.util.Date;
import java.util.List;

@Data
public class DeploymentOrderDTO {

    @JsonSerialize(using = ToStringSerializer.class)
    private Long deploymentOrderId;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long incidentId;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long orderedBy;
    private Date orderedAt;

    private List<DeploymentRequestDTO> deploymentRequests;
    private IncidentSeverity incidentSeverity;
    private String notes;
}
