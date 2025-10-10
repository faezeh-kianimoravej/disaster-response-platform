package nl.saxion.disaster.departmentservice.service;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.departmentservice.model.entity.Resource;
import nl.saxion.disaster.departmentservice.model.enums.ResourceType;
import nl.saxion.disaster.departmentservice.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    @Override
    public Optional<Resource> getResourceById(Long id) {
        return resourceRepository.findById(id);
    }

    @Override
    public List<Resource> getAvailableResources() {
        return resourceRepository.findAvailable();
    }

    @Override
    public List<Resource> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type);
    }

    @Override
    public List<Resource> getResourcesByDepartment(Long departmentId) {
        return resourceRepository.findByDepartment(departmentId);
    }

    // --- Create ---
    @Override
    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    // --- Update (Edit) ---
    @Override
    public Resource editResource(Long id, Resource resourceDetails) {
        return resourceRepository.edit(id, resourceDetails);
    }

    // --- Delete ---
    @Override
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }
}
