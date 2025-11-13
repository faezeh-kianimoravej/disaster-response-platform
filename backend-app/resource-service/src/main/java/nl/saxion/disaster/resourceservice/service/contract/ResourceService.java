package nl.saxion.disaster.resourceservice.service.contract;

import nl.saxion.disaster.resourceservice.dto.*;
import nl.saxion.disaster.resourceservice.model.enums.ResourceType;

import java.util.List;
import java.util.Optional;

public interface ResourceService {

    Optional<ResourceDto> getResourceById(Long id);

    List<ResourceDto> getAvailableResources();

    List<ResourceDto> getResourcesByType(ResourceType type);

    List<ResourceDto> getResourcesByDepartment(Long departmentId);

    ResourceDto createResource(ResourceDto resourceDto);

    ResourceDto editResource(Long id, ResourceDto resourceDetails);

    void deleteResource(Long id);

    List<ResourceSearchResponseDto> getNearestResourcesForIncident(ResourceSearchRequestDto resourceSearchRequestDto);

    void allocateResourcesToIncident(ResourceAllocationRequestDto request);

    Optional<ResourceBasicDto> getResourceBasicInfoById(Long id);

    Optional<ResourceLocationDto> getResourceLocationById(Long id);
}
