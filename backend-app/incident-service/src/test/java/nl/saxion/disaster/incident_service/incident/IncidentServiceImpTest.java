package nl.saxion.disaster.incident_service.incident;

import nl.saxion.disaster.incident_service.dto.IncidentRequest;
import nl.saxion.disaster.incident_service.dto.IncidentResponse;
import nl.saxion.disaster.incident_service.exception.ResourceNotFoundException;
import nl.saxion.disaster.incident_service.model.entity.Incident;
import nl.saxion.disaster.incident_service.model.enums.GripLevel;
import nl.saxion.disaster.incident_service.model.enums.Severity;
import nl.saxion.disaster.incident_service.model.enums.Status;
import nl.saxion.disaster.incident_service.repository.IncidentRepository;
import nl.saxion.disaster.incident_service.service.IncidentServiceImp;
import nl.saxion.disaster.incident_service.service.messaging.IncidentEventProducer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class IncidentServiceImpTest {

    private IncidentRepository repository;
    private IncidentEventProducer eventProducer;
    private IncidentServiceImp service;

    @BeforeEach
    void setup() {
        repository = mock(IncidentRepository.class);
        eventProducer = mock(IncidentEventProducer.class);
        service = new IncidentServiceImp(repository, eventProducer);
    }

    private Incident sampleIncident(Long id) {
        return Incident.builder()
                .incidentId(id)
                .reportedBy("112")
                .title("Fire in building")
                .description("Fire at main street")
                .severity(Severity.HIGH)
                .gripLevel(GripLevel.LEVEL_2)
                .status(Status.OPEN)
                .reportedAt(OffsetDateTime.now())
                .location("Main Street 12")
                .latitude(52.0)
                .longitude(5.0)
                .createdAt(OffsetDateTime.now())
                .updatedAt(OffsetDateTime.now())
                .build();
    }

    private IncidentRequest sampleRequest() {
        return new IncidentRequest(
                "112",
                "Fire in building",
                "Fire at main street",
                Severity.HIGH,
                GripLevel.LEVEL_2,
                Status.OPEN,
                OffsetDateTime.now(),
                "Main Street 12",
                52.0,
                5.0
        );
    }

    @Test
    void createIncident_ShouldSaveAndReturnResponse() {
        // given
        IncidentRequest req = sampleRequest();
        Incident incident = sampleIncident(1L);
        when(repository.save(any(Incident.class))).thenReturn(incident);

        // when
        IncidentResponse response = service.createIncident(req);

        // then
        assertThat(response.incidentId()).isEqualTo(1L);
        assertThat(response.title()).isEqualTo(req.title());

        ArgumentCaptor<Incident> captor = ArgumentCaptor.forClass(Incident.class);
        verify(repository).save(captor.capture());
        Incident savedEntity = captor.getValue();
        assertThat(savedEntity.getReportedBy()).isEqualTo(req.reportedBy());

        // Verify event producer called
        verify(eventProducer, times(1)).sendIncidentEvent(any());
    }

    @Test
    void getById_ShouldReturnIncidentResponse_WhenFound() {
        // given
        Incident incident = sampleIncident(10L);
        when(repository.findById(10L)).thenReturn(Optional.of(incident));

        // when
        IncidentResponse result = service.getById(10L);

        // then
        assertThat(result.incidentId()).isEqualTo(10L);
        verify(repository).findById(10L);
    }

    @Test
    void getById_ShouldThrow_WhenNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void list_ShouldReturnAll_WhenNoFilter() {
        List<Incident> incidents = List.of(sampleIncident(1L), sampleIncident(2L));
        when(repository.findAll()).thenReturn(incidents);

        List<IncidentResponse> responses = service.list(Optional.empty());

        assertThat(responses).hasSize(2);
        verify(repository).findAll();
    }

    @Test
    void list_ShouldReturnFiltered_WhenReportedByProvided() {
        when(repository.findByReportedBy("112")).thenReturn(List.of(sampleIncident(3L)));

        List<IncidentResponse> responses = service.list(Optional.of("112"));

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).incidentId()).isEqualTo(3L);
        verify(repository).findByReportedBy("112");
    }

    @Test
    void update_ShouldModifyExistingIncident() {
        Incident existing = sampleIncident(5L);
        when(repository.findById(5L)).thenReturn(Optional.of(existing));
        when(repository.save(any(Incident.class))).thenAnswer(inv -> inv.getArgument(0));

        IncidentRequest newReq = new IncidentRequest(
                "Bob",
                "Explosion",
                "Gas leak explosion",
                Severity.CRITICAL,
                GripLevel.LEVEL_3,
                Status.IN_PROGRESS,
                OffsetDateTime.now(),
                "Industrial Area",
                53.0,
                6.0
        );

        IncidentResponse updated = service.update(5L, newReq);

        assertThat(updated.reportedBy()).isEqualTo("Bob");
        assertThat(updated.title()).isEqualTo("Explosion");
        verify(repository).save(any(Incident.class));
    }

    @Test
    void update_ShouldThrow_WhenNotFound() {
        when(repository.findById(404L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.update(404L, sampleRequest()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("404");
    }

    @Test
    void delete_ShouldRemoveIncident_WhenExists() {
        when(repository.existsById(1L)).thenReturn(true);
        service.delete(1L);
        verify(repository).deleteById(1L);
    }

    @Test
    void delete_ShouldThrow_WhenNotFound() {
        when(repository.existsById(99L)).thenReturn(false);
        assertThatThrownBy(() -> service.delete(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }
}
