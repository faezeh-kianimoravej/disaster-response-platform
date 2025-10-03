package nl.saxion.disaster.resourceservice.service;

import nl.saxion.disaster.resourceservice.model.Resource;
import nl.saxion.disaster.resourceservice.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResourceServiceImpl implements ResourceService{

    private final ResourceRepository repository;

    public ResourceServiceImpl(ResourceRepository repository) {
        this.repository = repository;
    }

    public List<Resource> getAllResources() {
        return repository.findAll();
    }

    public Optional<Resource> getResourceById(Long id) {
        return repository.findById(id);
    }

    public Resource saveResource(Resource resource) {
        return repository.save(resource);
    }

    public void deleteResource(Long id) {
        repository.deleteById(id);
    }

}
