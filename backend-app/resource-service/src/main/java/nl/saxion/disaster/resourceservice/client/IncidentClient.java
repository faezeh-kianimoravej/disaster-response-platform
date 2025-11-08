package nl.saxion.disaster.resourceservice.client;

import nl.saxion.disaster.resourceservice.dto.IncidentLocationDto;
import nl.saxion.disaster.resourceservice.dto.IncidentResponseDto;
import nl.saxion.disaster.resourceservice.dto.ResourceAllocationItemDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;

/**
 * Feign client for communicating with the incident-service.
 * <p>
 * Used by the resource-service to:
 * <ul>
 *   <li>Retrieve the incident's location (for distance calculation).</li>
 *   <li>Validate the existence of an incident before allocation.</li>
 *   <li>Notify incident-service when resources are allocated to an incident.</li>
 * </ul>
 * </p>
 */
@FeignClient(name = "incident-service", path = "/api/incidents")
public interface IncidentClient {

    /**
     * Retrieves the location (latitude and longitude) of an incident.
     */
    @GetMapping("/{id}/location")
    IncidentLocationDto getIncidentLocation(@PathVariable("id") Long id);

    /**
     * Retrieves basic incident information by ID.
     * <p>
     * Used by the resource-service to validate that the incident exists
     * before finalizing resource allocation.
     * </p>
     */
    @GetMapping("/{id}/basic")
    IncidentResponseDto getIncidentBasicInfoById(@PathVariable("id") Long id);

    /**
     * Registers a list of allocated resources to a specific incident.
     * <p>
     * Called after resource availability is updated in the resource-service.
     * </p>
     */
    @PostMapping("/{incidentId}/resources")
    void assignResourcesToIncident(
            @PathVariable("incidentId") Long incidentId,
            @RequestBody List<ResourceAllocationItemDto> allocations
    );

    /**
     * Retrieves the total active allocations for a list of resource IDs.
     * <p>
     * Used by the resource-service to calculate available quantities
     * (total - allocated) when searching for available resources.
     * </p>
     */
    @GetMapping("/resources/allocations/active")
    Map<Long, Integer> getActiveAllocationsForResources(
            @RequestBody List<Long> resourceIds
    );
}
