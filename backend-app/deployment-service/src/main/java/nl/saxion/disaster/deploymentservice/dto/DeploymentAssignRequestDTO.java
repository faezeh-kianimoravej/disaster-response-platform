package nl.saxion.disaster.deploymentservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class DeploymentAssignRequestDTO {

    @NotNull
    private Long requestId;

    @NotNull
    private Long assignedBy;

    @NotNull
    private Long assignedUnitId;

    @NotNull
    private List<AssignedPersonnelDTO> assignedPersonnel;

    @NotNull
    private List<AllocatedResourceDTO> allocatedResources;

    @Size(max = 500)
    private String notes;

    @Data
    public static class AssignedPersonnelDTO {
        private Long slotId;
        private Long userId;
        private String specialization;
    }

    @Data
    public static class AllocatedResourceDTO {
        private Long resourceId;
        private Integer quantity;
        private Boolean isPrimary;
    }
}
