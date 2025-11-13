package nl.saxion.disaster.deploymentservice.dto;

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
    private Long incidentId;

    @NotNull
    @Min(1)
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
        private Long targetDepartmentId;

        @NotNull
        private ResponseUnitType requestedUnitType;

        @Min(1)
        private int requestedQuantity;
    }
}
