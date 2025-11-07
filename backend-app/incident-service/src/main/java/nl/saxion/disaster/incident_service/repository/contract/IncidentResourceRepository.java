package nl.saxion.disaster.incident_service.repository.contract;

import nl.saxion.disaster.incident_service.dto.ResourceAllocationItemDto;
import nl.saxion.disaster.incident_service.model.entity.Incident;
import nl.saxion.disaster.incident_service.model.entity.IncidentResource;

import java.util.List;
import java.util.Map;

public interface IncidentResourceRepository {

    /**
     * Retrieves all resource allocations for a given incident.
     *
     * @param incidentId the ID of the incident
     * @return list of allocated resources
     */
    List<IncidentResource> findByIncidentId(Long incidentId);

    /**
     * Updates the incident after new resource allocations have been made.
     * <p>
     * Typically called after the resource-service finalizes an allocation,
     * allowing the incident-service to persist the relationship between
     * an {@link Incident} and the assigned resources in the database.
     * </p>
     *
     * @param incident    the {@link Incident} entity being updated
     * @param allocations list of allocated resources to be linked with this incident
     */
    void updateIncidentAfterResourceAssignment(Incident incident, List<ResourceAllocationItemDto> allocations);

    /**
     * Retrieves the total allocated quantity for each resource ID where the allocation is active.
     * <p>
     * This method aggregates (SUM) the quantity field from the {@code incident_resources} table
     * for all records where {@code isAllocated = true} and the {@code resource_id} is included
     * in the given list.
     * <br><br>
     * Used by the resource-service (via FeignClient) to calculate the number of
     * currently available resources:
     * <pre>
     * available = totalQuantity - allocatedQuantity
     * </pre>
     * </p>
     *
     * @param resourceIds list of resource IDs to check allocations for
     * @return a map where each key is a resource ID and each value is the total allocated quantity
     * for that resource (only active allocations are included)
     */
    Map<Long, Integer> findActiveAllocations(List<Long> resourceIds);
}
