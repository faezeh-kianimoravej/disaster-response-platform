package nl.saxion.disaster.incident_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.incident_service.dto.*;
import nl.saxion.disaster.incident_service.exception.ResourceNotFoundException;
import nl.saxion.disaster.incident_service.service.contract.IncidentResourceService;
import nl.saxion.disaster.incident_service.service.contract.IncidentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller exposing endpoints for managing incidents.
 * Registered as a Eureka client and documented with OpenAPI (Swagger).
 */
@Slf4j
@Tag(name = "Incident API", description = "Endpoints for managing and retrieving incident information")
@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService incidentService;
    private final IncidentResourceService incidentResourceService;

    // ----------------------------------------------------------------------------------------
    // Create a new incident
    // ----------------------------------------------------------------------------------------
    @PostMapping
    @Operation(summary = "Create a new incident", description = "Adds a new incident record to the system.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Incident successfully created"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<IncidentResponse> create(@Valid @RequestBody IncidentRequest req) {
        IncidentResponse created = incidentService.createIncident(req);
        return ResponseEntity.created(URI.create("/api/incidents/" + created.incidentId())).body(created);
    }

    // ----------------------------------------------------------------------------------------
    // Get by ID
    // ----------------------------------------------------------------------------------------
    @GetMapping("/{id}")
    @Operation(summary = "Get incident by ID", description = "Fetch a single incident by its unique ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Incident retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    public ResponseEntity<IncidentResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(incidentService.getById(id));
    }

    // ----------------------------------------------------------------------------------------
    // List all (or filter by reporter)
    // ----------------------------------------------------------------------------------------
    @GetMapping
    @Operation(summary = "List all incidents", description = "Fetch all existing incidents or filter by reporter.")
    public ResponseEntity<List<IncidentResponse>> list(@RequestParam Optional<String> reportedBy) {
        return ResponseEntity.ok(incidentService.list(reportedBy));
    }

    @GetMapping("/region/{regionId}")
    @Operation(summary = "List all incidents by regionId", description = "Fetch all existing incidents for a region.")
    public ResponseEntity<List<IncidentResponse>> listByRegion(@PathVariable Long regionId) {
        return ResponseEntity.ok(incidentService.listByRegionId(regionId));
    }

    // ----------------------------------------------------------------------------------------
    // Update
    // ----------------------------------------------------------------------------------------
    @PutMapping("/{id}")
    @Operation(summary = "Update an incident", description = "Modify details of an existing incident by ID.")
    public ResponseEntity<IncidentResponse> update(@PathVariable Long id, @Valid @RequestBody IncidentRequest req) {
        return ResponseEntity.ok(incidentService.update(id, req));
    }

    // ----------------------------------------------------------------------------------------
    // Delete
    // ----------------------------------------------------------------------------------------
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an incident", description = "Remove an incident record permanently by ID.")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        incidentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ----------------------------------------------------------------------------------------
    // Get incident location (used by resource-service)
    // ----------------------------------------------------------------------------------------

    /**
     * Returns the geographic location (latitude and longitude) of a specific incident.
     * <p>
     * This endpoint is primarily used by the <b>resource-service</b> to retrieve
     * an incident’s location when allocating or filtering available resources
     * based on proximity.
     * </p>
     * <p>
     * Example:
     * GET /api/incidents/42/location → { "latitude": 52.266, "longitude": 6.157 }
     *
     * @param id the unique identifier of the incident
     * @return {@link IncidentLocationDto} if the incident exists, otherwise 404 Not Found
     */
    @GetMapping("/{id}/location")
    @Operation(summary = "Get location of an incident", description = "Fetch latitude and longitude for a specific incident.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Location data retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    public ResponseEntity<IncidentLocationDto> getIncidentLocation(@PathVariable Long id) {
        return incidentService.getIncidentLocation(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Retrieves a lightweight view of an incident (ID, title, status) by its unique identifier.
     * <p>
     * This endpoint is designed for inter-service communication and is primarily called
     * by the <b>resource-service</b> to validate that an incident exists before
     * finalizing resource allocation.
     * </p>
     * <p>
     * Example usage:
     * <pre>
     *   GET /api/incidents/15/basic
     *   Response:
     *   {
     *       "incidentId": 15,
     *       "title": "Flood in Deventer",
     *       "status": "ACTIVE"
     *   }
     * </pre>
     *
     * @param id the unique identifier of the incident
     * @return {@link IncidentResponseDto} if found, otherwise 404 (Not Found)
     */
    @GetMapping("/{id}/basic")
    @Operation(
            summary = "Get basic incident information",
            description = """
                    Returns a lightweight representation of an incident (ID, title, status).
                    This endpoint is primarily used by other microservices such as 
                    the resource-service to validate incident existence before resource allocation.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Incident information retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    public ResponseEntity<IncidentResponseDto> getIncidentBasicInfoById(@PathVariable Long id) {
        return incidentService.getIncidentBasicInfoById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/resources")
    @Operation(
            summary = "Assign resources to an incident",
            description = """
                    Receives a list of allocated resources from the resource-service 
                    when an incident is finalized. 
                    This endpoint updates the incident with the allocated resources.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resources successfully assigned to the incident"),
            @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    public ResponseEntity<Void> assignResourcesToIncident(
            @PathVariable Long id,
            @RequestBody List<ResourceAllocationItemDto> allocations
    ) {
        incidentService.assignResourcesToIncident(id, allocations);
        return ResponseEntity.ok().build();
    }

    // ----------------------------------------------------------------------------------------
// Get allocated resources of an incident
// ----------------------------------------------------------------------------------------
    @GetMapping("/{id}/resources")
    @Operation(
            summary = "Get allocated resources of an incident",
            description = """
                    Returns all resources currently assigned to a specific incident.
                    The response includes resource type, department, municipality, and quantity.
                    Used by the frontend to reload previous allocations when reopening
                    the Resource Allocation form.
                    """
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Allocated resources retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Incident not found")
    })
    public ResponseEntity<List<IncidentResourceResponseDto>> getAllocatedResources(@PathVariable Long id) {
        log.info("Fetching allocated resources for Incident ID {}", id);

        // Check if the incident exists
        IncidentResponse incidentResponse = incidentService.getById(id);
        if (incidentResponse == null) {
            throw new ResourceNotFoundException("Incident with ID " + id + " not found");
        }

        // Retrieve all allocated resources for the given incident
        List<IncidentResourceResponseDto> resources = incidentResourceService.getResourcesByIncidentId(id);

        // If no resources are allocated, return an empty list with status 200 (OK)
        if (resources.isEmpty()) {
            log.info("Incident {} has no allocated resources yet.", id);
            return ResponseEntity.ok(Collections.emptyList());
        }

        // Return all allocated resources
        log.info("Returning {} allocated resources for Incident ID {}", resources.size(), id);
        return ResponseEntity.ok(resources);
    }
}
