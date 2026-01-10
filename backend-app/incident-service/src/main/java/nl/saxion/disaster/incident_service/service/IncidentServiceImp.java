package nl.saxion.disaster.incident_service.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.incident_service.dto.*;
import nl.saxion.disaster.incident_service.exception.ResourceNotFoundException;
import nl.saxion.disaster.incident_service.model.entity.Incident;
import nl.saxion.disaster.incident_service.repository.contract.IncidentRepository;
import nl.saxion.disaster.incident_service.service.contract.IncidentService;
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
                .regionId(req.regionId())
                .build();

        // Save to database
        Incident savedIncident = repository.save(incident);
        log.info("Incident saved successfully: {}", savedIncident.getIncidentId());

        // Build the event object for Kafka
        IncidentEvent event = IncidentEvent.builder()
                .notificationId(0L)
                .incidentId(savedIncident.getIncidentId())
                .regionId(savedIncident.getRegionId())
                .incidentTitle(savedIncident.getTitle())
                .incidentDescription(savedIncident.getDescription())
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

    /**
     * Retrieves a lightweight view of an incident containing only its basic details.
     * <p>
     * This method is mainly used for inter-service communication — for example,
     * the <b>resource-service</b> calls it to verify that an incident exists
     * before allocating resources.
     * </p>
     *
     * @param id the unique identifier of the incident
     * @return an {@link Optional} containing {@link IncidentResponseDto} if the incident exists,
     * or an empty Optional if not found
     */
    @Override
    public Optional<IncidentBasicDTO> getIncidentBasicInfoById(Long id) {
        return repository.findById(id)
                .map(incident -> {
                    IncidentBasicDTO dto = new IncidentBasicDTO();

                    dto.setIncidentId(incident.getIncidentId());
                    dto.setReportedBy(incident.getReportedBy());
                    dto.setTitle(incident.getTitle());
                    dto.setDescription(incident.getDescription());

                    dto.setSeverity(incident.getSeverity() == null ? null : incident.getSeverity().name());
                    dto.setGripLevel(incident.getGripLevel() == null ? null : incident.getGripLevel().name());
                    dto.setStatus(incident.getStatus() == null ? null : incident.getStatus().name());

                    dto.setReportedAt(incident.getReportedAt());
                    dto.setLocation(incident.getLocation());
                    dto.setLatitude(incident.getLatitude());
                    dto.setLongitude(incident.getLongitude());
                    dto.setRegionId(incident.getRegionId());
                    dto.setCreatedAt(incident.getCreatedAt());
                    dto.setUpdatedAt(incident.getUpdatedAt());

                    return dto;
                });
    }


    public List<IncidentResponse> list(Optional<String> reportedBy) {
        List<Incident> list = reportedBy.map(repository::findByReportedBy)
                .orElseGet(repository::findAll);
        return list.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<IncidentResponse> listByRegionId(Long regionId) {
        List<Incident> list = repository.findByRegionId(regionId);
        return list.stream().map(this::toResponse).collect(Collectors.toList());
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
                inc.getLatitude(), inc.getLongitude(), inc.getRegionId(),
                inc.getCreatedAt(), inc.getUpdatedAt()
        );
    }

    /**
     * Retrieves the geographic coordinates (latitude and longitude) of a specific incident.
     * <p>
     * This method is mainly used to support inter-service communication with the
     * <b>resource-service</b>, which requires incident location data to calculate
     * distances and find the nearest available resources.
     * </p>
     * <p>
     * Only essential location fields are mapped into {@link IncidentLocationDto}
     * to minimize data transfer and ensure loose coupling between services.
     * </p>
     *
     * @param id the unique identifier of the incident
     * @return an {@link Optional} containing {@link IncidentLocationDto} if found,
     * or an empty Optional if the incident does not exist
     */
    public Optional<IncidentLocationDto> getIncidentLocation(Long id) {
        return repository.findById(id)
                .map(incident -> new IncidentLocationDto(
                        incident.getLatitude(),
                        incident.getLongitude()
                ));
    }
}

