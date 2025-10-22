package nl.saxion.disaster.incident_service.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.incident_service.dto.IncidentRequest;
import nl.saxion.disaster.incident_service.dto.IncidentResponse;
import nl.saxion.disaster.incident_service.exception.ResourceNotFoundException;
import nl.saxion.disaster.incident_service.model.entity.Incident;
import nl.saxion.disaster.incident_service.repository.IncidentRepository;
import nl.saxion.disaster.incident_service.service.messaging.IncidentEventProducer;
import nl.saxion.disaster.shared.event.IncidentEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class IncidentServiceImp implements IncidentService {

    private final IncidentRepository repository;
    private final IncidentEventProducer incidentEventProducer;

    @Override
    public IncidentResponse createIncident(IncidentRequest req) {
        // Create new Incident entity from request
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

        // Save to database
        Incident savedIncident = repository.save(incident);
        log.info("Incident saved successfully: {}", savedIncident.getIncidentId());

        // Build the event object for Kafka
        IncidentEvent event = IncidentEvent.builder()
                .notificationId(0L)
                .incidentId(savedIncident.getIncidentId())
                .type("")
                .message(savedIncident.getDescription())
                .Severity(savedIncident.getSeverity().name())
                .location(savedIncident.getLocation())
                .status(savedIncident.getStatus().name())
                .createdBy("112")
                .createdAt(savedIncident.getCreatedAt())
                .sendTime(savedIncident.getReportedAt())
                .build();

        //Send event to Kafka topic
        incidentEventProducer.sendIncidentEvent(event);
        log.info("Incident event sent to Kafka for incident ID={}", savedIncident.getIncidentId());

        //Return response
        return toResponse(savedIncident);
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

