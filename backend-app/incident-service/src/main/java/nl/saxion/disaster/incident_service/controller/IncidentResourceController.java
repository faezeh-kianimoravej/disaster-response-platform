package nl.saxion.disaster.incident_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.incident_service.service.contract.IncidentResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents/resources")
@RequiredArgsConstructor
public class IncidentResourceController {

    private final IncidentResourceService incidentResourceService;

    // ----------------------------------------------------------------------------------------
    // Get total active allocations for given resource IDs
    // ----------------------------------------------------------------------------------------
    @PostMapping("/allocations/active")
    @Operation(
            summary = "Get total active allocations for given resource IDs",
            description = """
                    Accepts a list of resource IDs and returns a map of
                    resourceId → total allocated quantity for all currently active allocations.
                    Used by the resource-service to calculate available quantities.
                    """
    )
    @ApiResponse(responseCode = "200", description = "Active allocations retrieved successfully")
    public ResponseEntity<Map<Long, Integer>> getActiveAllocations(@RequestBody List<Long> resourceIds) {
        Map<Long, Integer> allocations = incidentResourceService.getActiveAllocationsForResources(resourceIds);
        return ResponseEntity.ok(allocations);
    }
}
