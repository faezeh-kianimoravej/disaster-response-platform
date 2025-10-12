package nl.saxion.disaster.departmentservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.departmentservice.model.entity.Resource;
import nl.saxion.disaster.departmentservice.model.enums.ResourceType;
import nl.saxion.disaster.departmentservice.service.contract.ResourceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Tag(
        name = "Resource Management",
        description = "Endpoints for managing resources, filtering them by type or department, and retrieving resource categories."
)
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ResourceController {

    private final ResourceService resourceService;

    @Operation(
            summary = "Get all resource types",
            description = "Retrieve the list of available resource types with their names and descriptions. Useful for dropdowns or selection lists in the UI."
    )
    @GetMapping("/resource-types")
    public ResponseEntity<List<Map<String, String>>> getAllResourceTypes() {
        List<Map<String, String>> resourceTypes = Arrays.stream(ResourceType.values())
                .map(type -> Map.of("name", type.name(), "description", type.getDescription()))
                .toList();

        return ResponseEntity.ok(resourceTypes);
    }

    @Operation(
            summary = "Get resource by ID",
            description = "Retrieve detailed information about a specific resource using its unique ID."
    )
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        return resourceService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }


    @Operation(
            summary = "Get all available resources",
            description = "Retrieve all resources that are currently available and not assigned to any ongoing operation."
    )
    @GetMapping("/available")
    public ResponseEntity<List<Resource>> getAvailableResources() {
        return ResponseEntity.ok(resourceService.getAvailableResources());
    }


    @Operation(
            summary = "Get resources by type",
            description = "Retrieve all resources filtered by their type (e.g., MEDICAL, VEHICLE, EQUIPMENT)."
    )
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Resource>> getResourcesByType(@PathVariable ResourceType type) {
        return ResponseEntity.ok(resourceService.getResourcesByType(type));
    }

    @Operation(
            summary = "Get resources by department ID",
            description = "Retrieve all resources that belong to a specific department using the department's unique ID."
    )
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Resource>> getResourcesByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(resourceService.getResourcesByDepartment(departmentId));
    }

    @Operation(
            summary = "Create a new resource",
            description = "Add a new resource to the system by providing its type, status, and department."
    )
    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody Resource resource) {
        Resource created = resourceService.createResource(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }


    @Operation(
            summary = "Edit an existing resource",
            description = "Update a resource’s information, such as name, availability, or assigned department."
    )
    @PutMapping("/{id}")
    public ResponseEntity<Resource> editResource(@PathVariable Long id, @RequestBody Resource resourceDetails) {
        Resource updated = resourceService.editResource(id, resourceDetails);
        return ResponseEntity.ok(updated);
    }


    @Operation(
            summary = "Delete resource by ID",
            description = "Remove a resource from the system permanently using its unique ID."
    )
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
