package nl.saxion.disaster.deploymentservice.service;

import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderDTO;
import nl.saxion.disaster.deploymentservice.event.DeploymentEventPublisher;
import nl.saxion.disaster.deploymentservice.mapper.DeploymentOrderMapper;
import nl.saxion.disaster.deploymentservice.model.DeploymentOrder;
import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeploymentOrderServiceImplTest {

    @Mock
    private DeploymentOrderRepository repository;

    @Mock
    private DeploymentOrderMapper mapper;

    @Mock
    private DeploymentEventPublisher eventPublisher;

    private DeploymentOrderServiceImpl service;

    private DeploymentOrderCreateDTO createDTO;
    private DeploymentOrder savedEntity;
    private DeploymentOrderDTO savedDTO;

    @BeforeEach
    void setUp() {
        service = new DeploymentOrderServiceImpl(repository, mapper, eventPublisher);

        // ----- CreateDTO -----
        DeploymentOrderCreateDTO.Request request = new DeploymentOrderCreateDTO.Request();
        request.setTargetDepartmentId(20L);
        request.setRequestedUnitType(null);
        request.setRequestedQuantity(1);

        createDTO = new DeploymentOrderCreateDTO();
        createDTO.setIncidentId(100L);
        createDTO.setOrderedBy(10L);
        createDTO.setDeploymentRequests(Collections.singletonList(request));

        // ----- Mock Entity -----
        savedEntity = new DeploymentOrder();
        savedEntity.setDeploymentOrderId(1L);
        savedEntity.setIncidentId(100L);
        savedEntity.setOrderedBy(10L);

        DeploymentRequest dr = new DeploymentRequest();
        dr.setTargetDepartmentId(20L);
        savedEntity.setDeploymentRequests(Collections.singletonList(dr));

        // ----- Mock DTO -----
        savedDTO = new DeploymentOrderDTO();
        savedDTO.setDeploymentOrderId(1L);
        savedDTO.setIncidentId(100L);
        savedDTO.setOrderedBy(10L);
    }

    @Test
    void testCreateDeploymentOrder() {
        // repo saves entity
        when(repository.saveDeploymentOrder(any(DeploymentOrder.class)))
                .thenReturn(savedEntity);

        // mapper converts to DTO
        when(mapper.toDto(savedEntity)).thenReturn(savedDTO);

        DeploymentOrderDTO result = service.createDeploymentOrder(createDTO);

        assertThat(result).isNotNull();
        assertThat(result.getDeploymentOrderId()).isEqualTo(1L);

        verify(repository, times(1)).saveDeploymentOrder(any());
        verify(mapper, times(1)).toDto(savedEntity);

        // VERY IMPORTANT: publish event for each request!
        verify(eventPublisher, times(1))
                .publish(any());
    }

    @Test
    void testGetDeploymentOrderByIncidentId() {
        when(repository.findDeploymentOrderByIncidentId(100L))
                .thenReturn(Optional.of(savedEntity));

        when(mapper.toDto(savedEntity)).thenReturn(savedDTO);

        DeploymentOrderDTO result = service.getDeploymentOrderByIncidentId(100L);

        assertThat(result).isNotNull();
        assertThat(result.getIncidentId()).isEqualTo(100L);

        verify(repository, times(1))
                .findDeploymentOrderByIncidentId(100L);

        verify(mapper, times(1))
                .toDto(savedEntity);
    }
}
