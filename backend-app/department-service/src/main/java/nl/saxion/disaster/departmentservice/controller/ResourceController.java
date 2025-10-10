package nl.saxion.disaster.departmentservice.controller;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.departmentservice.model.entity.Resource;
import nl.saxion.disaster.departmentservice.model.enums.ResourceType;
import nl.saxion.disaster.departmentservice.service.ResourceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping("/resource-types")
    public ResponseEntity<List<Map<String, String>>> getAllResourceTypes() {
        List<Map<String, String>> resourceTypes = Arrays.stream(ResourceType.values())
                .map(type -> Map.of("name", type.name(), "description", type.getDescription()))
                .toList();

        return ResponseEntity.ok(resourceTypes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        return resourceService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping("/available")
    public ResponseEntity<List<Resource>> getAvailableResources() {
        return ResponseEntity.ok(resourceService.getAvailableResources());
    }


    @GetMapping("/type/{type}")
    public ResponseEntity<List<Resource>> getResourcesByType(@PathVariable ResourceType type) {
        return ResponseEntity.ok(resourceService.getResourcesByType(type));
    }


    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Resource>> getResourcesByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(resourceService.getResourcesByDepartment(departmentId));
    }


    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody Resource resource) {
        Resource created = resourceService.createResource(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }


    @PutMapping("/{id}")
    public ResponseEntity<Resource> editResource(@PathVariable Long id, @RequestBody Resource resourceDetails) {
        Resource updated = resourceService.editResource(id, resourceDetails);
        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
