package nl.saxion.disaster.incident_service.service.contract;

import nl.saxion.disaster.incident_service.dto.IncidentResourceResponseDto;

import java.util.List;
import java.util.Map;

public interface IncidentResourceService {

    /**
     * Returns all resources currently assigned to a given incident.
     *
     * @param incidentId the unique ID of the incident
     * @return list of allocated resources as DTOs
     */
    List<IncidentResourceResponseDto> getResourcesByIncidentId(Long incidentId);

    Map<Long, Integer> getActiveAllocationsForResources(List<Long> resourceIds);
}
