package nl.saxion.disaster.resourceservice.service;

import nl.saxion.disaster.resourceservice.model.Resource;

import java.util.List;
import java.util.Optional;

public interface ResourceService {

    List<Resource> getAllResources();
    Optional<Resource> getResourceById(Long id);
    Resource saveResource(Resource resource);
    void deleteResource(Long id);
}
