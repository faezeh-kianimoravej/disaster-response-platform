package nl.saxion.disaster.resourceservice.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ResourceAllocationBatchRequestDTO {
    private Long deploymentId;
    private Long responseUnitId;
    private List<ResourceAllocationItemDTO> allocations;
}
