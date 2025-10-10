package nl.saxion.disaster.departmentservice.service.contract;

import nl.saxion.disaster.departmentservice.model.entity.Resource;
import nl.saxion.disaster.departmentservice.model.enums.ResourceType;

import java.util.List;
import java.util.Optional;

public interface ResourceService {

    Optional<Resource> getResourceById(Long id);

    List<Resource> getAvailableResources();

    List<Resource> getResourcesByType(ResourceType type);

    List<Resource> getResourcesByDepartment(Long departmentId);

    Resource createResource(Resource resource);

    Resource editResource(Long id, Resource resourceDetails);

    void deleteResource(Long id);
}
