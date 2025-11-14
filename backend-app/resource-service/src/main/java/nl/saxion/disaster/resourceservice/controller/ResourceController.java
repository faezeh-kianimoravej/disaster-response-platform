package nl.saxion.disaster.resourceservice.controller;


import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.resourceservice.dto.*;
import nl.saxion.disaster.resourceservice.model.enums.ResourceType;
import nl.saxion.disaster.resourceservice.service.contract.ResourceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(
        name = "Resource Management",
        description = "Endpoints for managing resources, filtering them by resourceType or department, and retrieving resource categories."
)
@Slf4j
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @Operation(
            summary = "Get resource by ID",
            description = "Retrieve detailed information about a specific resource using its unique ID."
    )
    @GetMapping("/{id}")
    public ResponseEntity<ResourceDto> getResourceById(@PathVariable Long id) {
        return resourceService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @Operation(
            summary = "Get resource location by ID",
            description = "Retrieve only the location (latitude, longitude) of a specific resource by ID."
    )
    @GetMapping("/{id}/location")
    public ResponseEntity<ResourceLocationDto> getResourceLocationById(@PathVariable Long id) {
        log.info("Fetching location for resource ID: {}", id);
        return resourceService.getResourceLocationById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    log.warn("Resource with ID {} not found", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @Operation(
            summary = "Get all available resources",
            description = "Retrieve all resources that are currently available and not assigned to any ongoing operation."
    )
    @GetMapping("/available")
    public ResponseEntity<List<ResourceDto>> getAvailableResources() {
        return ResponseEntity.ok(resourceService.getAvailableResources());
    }

    @Operation(
        summary = "Get available resources by department",
        description = "Retrieve all resources that are currently available for a specific department."
    )
    @GetMapping("/available/department/{departmentId}")
    public ResponseEntity<List<ResourceDto>> getAvailableResourcesByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(resourceService.getAvailableResourcesByDepartment(departmentId));
    }

    @Operation(
            summary = "Get resources by resourceType",
            description = "Retrieve all resources filtered by their resourceType (e.g., AMBULANCE, FIELD_OPERATOR, FIRE_TRUCK, etc.)."
    )
    @GetMapping("/resourceType/{resourceType}")
    public ResponseEntity<List<ResourceDto>> getResourcesByType(@PathVariable ResourceType resourceType) {
        return ResponseEntity.ok(resourceService.getResourcesByType(resourceType));
    }

    @Operation(
            summary = "Get resources by department ID",
            description = "Retrieve all resources that belong to a specific department using the department's unique ID."
    )
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<ResourceDto>> getResourcesByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(resourceService.getResourcesByDepartment(departmentId));
    }

    @Operation(
            summary = "Create a new resource",
            description = "Add a new resource to the system by providing its name, resourceType, quantity, and department."
    )
    @PostMapping
    public ResponseEntity<ResourceDto> createResource(@RequestBody ResourceDto resourceDto) {
        ResourceDto created = resourceService.createResource(resourceDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @Operation(
            summary = "Edit an existing resource",
            description = "Update a resource’s information, such as name, availability, or assigned department."
    )
    @PutMapping("/{id}")
    public ResponseEntity<ResourceDto> editResource(@PathVariable Long id, @RequestBody ResourceDto resourceDetails) {
        ResourceDto updated = resourceService.editResource(id, resourceDetails);
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

    @GetMapping("/{id}/basic")
    @Operation(
            summary = "Get basic resource info by ID (for inter-service use)",
            description = """
                    Returns minimal resource information such as ID, type, and department ID.
                    This endpoint is used internally by other microservices (e.g., incident-service)
                    to fetch essential resource details without exposing the entire resource object.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Basic resource info retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Resource not found")
    })
    public ResponseEntity<ResourceBasicDto> getResourceBasicInfoById(@PathVariable Long id) {
        log.info("Fetching basic info for resource ID: {}", id);

        return resourceService.getResourceBasicInfoById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    log.warn("Resource with ID {} not found", id);
                    return ResponseEntity.notFound().build();
                });
    }
}
