package nl.saxion.disaster.incident_service.service.contract;


import nl.saxion.disaster.incident_service.dto.*;

import java.util.List;
import java.util.Optional;


public interface IncidentService {
    IncidentResponse createIncident(IncidentRequest request);

    IncidentResponse getById(Long id);

    Optional<IncidentResponseDto> getIncidentBasicInfoById(Long id);

    List<IncidentResponse> list(Optional<String> departmentName);

    List<IncidentResponse> listByRegionId(Long regionId);

    IncidentResponse update(Long id, IncidentRequest request);

    void delete(Long id);

    Optional<IncidentLocationDto> getIncidentLocation(Long id);

    /**
     * Assigns a list of resources to an existing incident.
     * <p>
     * This method is called by the <b>resource-service</b> once the user finalizes
     * the resource allocation process. It links the allocated resources to the specified incident.
     * </p>
     *
     * @param incidentId  the unique identifier of the incident
     * @param allocations list of allocated resources (resourceId + quantity)
     */
    void assignResourcesToIncident(Long incidentId, List<ResourceAllocationItemDto> allocations);
}
