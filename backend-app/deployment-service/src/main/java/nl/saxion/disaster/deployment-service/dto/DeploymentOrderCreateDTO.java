package nl.saxion.disaster.deploymentservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class DeploymentOrderCreateDTO {
    @NotNull
    private Long incidentId;

    @NotNull
    private Long orderedBy;

    @NotBlank
    private String incidentSeverity;

    @Min(0)
    private int gripLevel;

    private String instructions;

    @NotNull
    private List<Request> deploymentRequests;

    @Data
    public static class Request {
        @NotNull
        private Long targetDepartmentId;

        @NotBlank
        private String priority;

        @NotBlank
        private String requestedUnitType;

        @Min(1)
        private int requestedQuantity;

        private String notes;
    }
}
