package nl.saxion.disaster.deploymentservice.dto;

import java.util.List;

public record ResourceAllocationBatchRequestDTO(
        Long deploymentId,
        Long responseUnitId,
        List<ResourceAllocationItemDTO> allocations
) {}
