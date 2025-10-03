package nl.saxion.disaster.resourceservice.controller;

import nl.saxion.disaster.resourceservice.model.Resource;
import nl.saxion.disaster.resourceservice.service.ResourceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/resources")
public class ResourceController {

    private final ResourceService service;

    public ResourceController(ResourceService service) {
        this.service = service;
    }

    @GetMapping
    public List<Resource> getAllResources() {
        return service.getAllResources();
    }

    @GetMapping("/{id}")
    public Optional<Resource> getResourceById(@PathVariable Long id) {
        return service.getResourceById(id);
    }

    @PostMapping
    public Resource addResource(@RequestBody Resource resource) {
        return service.saveResource(resource);
    }

    @DeleteMapping("/{id}")
    public void deleteResource(@PathVariable Long id) {
        service.deleteResource(id);
    }
}
