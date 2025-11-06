package nl.saxion.disaster.incident_service.repository.contract;

import nl.saxion.disaster.incident_service.dto.ResourceAllocationItemDto;
import nl.saxion.disaster.incident_service.model.entity.Incident;
import nl.saxion.disaster.incident_service.model.entity.IncidentResource;

import java.util.List;

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
}
