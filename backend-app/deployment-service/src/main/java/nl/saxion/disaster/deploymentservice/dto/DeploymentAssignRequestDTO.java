package nl.saxion.disaster.deploymentservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class DeploymentAssignRequestDTO {

    @NotNull
    private Long assignedBy;
    
    @Size(max = 500)
    private String notes;
}
