package nl.saxion.disaster.incident_service.service;


import nl.saxion.disaster.incident_service.exception.ResourceNotFoundException;
import nl.saxion.disaster.incident_service.dto.*;
import nl.saxion.disaster.incident_service.model.entity.Incident;
import nl.saxion.disaster.incident_service.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class IncidentServiceImp implements IncidentService{

    private final IncidentRepository repository;

    public IncidentResponse createIncident(IncidentRequest req) {
        Incident incident = Incident.builder()
                .reportedBy(req.reportedBy())
                .title(req.title())
                .description(req.description())
                .severity(req.severity())
                .gripLevel(req.gripLevel())
                .status(req.status())
                .reportedAt(req.reportedAt())
                .location(req.location())
                .latitude(req.latitude())
                .longitude(req.longitude())
                .build();

        return toResponse(repository.save(incident));
    }

    public IncidentResponse getById(Long id) {
        Incident inc = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + id));
        return toResponse(inc);
    }

    public List<IncidentResponse> list(Optional<String> reportedBy) {
        List<Incident> list = reportedBy.map(repository::findByReportedBy)
                .orElseGet(repository::findAll);
        return list.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public IncidentResponse update(Long id, IncidentRequest req) {
        Incident inc = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found: " + id));

        inc.setReportedBy(req.reportedBy());
        inc.setTitle(req.title());
        inc.setDescription(req.description());
        inc.setSeverity(req.severity());
        inc.setGripLevel(req.gripLevel());
        inc.setStatus(req.status());
        inc.setReportedAt(req.reportedAt());
        inc.setLocation(req.location());
        inc.setLatitude(req.latitude());
        inc.setLongitude(req.longitude());

        return toResponse(repository.save(inc));
    }

    public void delete(Long id) {
        if (!repository.existsById(id))
            throw new ResourceNotFoundException("Incident not found: " + id);
        repository.deleteById(id);
    }

    private IncidentResponse toResponse(Incident inc) {
        return new IncidentResponse(
                inc.getIncidentId(), inc.getReportedBy(), inc.getTitle(),
                inc.getDescription(), inc.getSeverity(), inc.getGripLevel(),
                inc.getStatus(), inc.getReportedAt(), inc.getLocation(),
                inc.getLatitude(), inc.getLongitude(),
                inc.getCreatedAt(), inc.getUpdatedAt()
        );
    }
}

