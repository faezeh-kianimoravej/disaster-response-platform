package nl.saxion.disaster.departmentservice.service.contract;

import nl.saxion.disaster.departmentservice.dto.ResourceDto;
import nl.saxion.disaster.departmentservice.model.enums.ResourceType;

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
}
