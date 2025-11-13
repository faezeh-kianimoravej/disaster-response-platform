package nl.saxion.disaster.deploymentservice.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import nl.saxion.disaster.deploymentservice.enums.IncidentSeverity;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;

import java.util.List;

@Data
public class DeploymentOrderCreateDTO {
    @NotNull
    @Min(1)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long incidentId;

    @NotNull
    @Min(1)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long orderedBy;

    @NotNull
    private IncidentSeverity incidentSeverity;

    private String notes;

    @NotNull
    private List<Request> deploymentRequests;

    @Data
    public static class Request {
        @NotNull
        @Min(1)
        @JsonSerialize(using = ToStringSerializer.class)
        private Long targetDepartmentId;

        @NotNull
        private ResponseUnitType requestedUnitType;

        @Min(1)
        private int requestedQuantity;
    }
}
