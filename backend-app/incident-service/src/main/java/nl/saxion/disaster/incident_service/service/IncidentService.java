package nl.saxion.disaster.incident_service.service;


import nl.saxion.disaster.incident_service.dto.IncidentRequest;
import nl.saxion.disaster.incident_service.dto.IncidentResponse;

import java.util.List;
import java.util.Optional;


public interface IncidentService {
    IncidentResponse createIncident(IncidentRequest request);
    IncidentResponse getById(Long id);
    List<IncidentResponse> list(Optional<String> departmentId);
    IncidentResponse update(Long id, IncidentRequest request);
    void delete(Long id);
}
