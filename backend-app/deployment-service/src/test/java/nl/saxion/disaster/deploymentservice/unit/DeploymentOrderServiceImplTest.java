package nl.saxion.disaster.deploymentservice.unit;

import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderDTO;
import nl.saxion.disaster.deploymentservice.enums.DeploymentRequestStatus;
import nl.saxion.disaster.deploymentservice.enums.IncidentSeverity;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitType;
import nl.saxion.disaster.deploymentservice.event.DeploymentEventPublisher;
import nl.saxion.disaster.deploymentservice.mapper.DeploymentOrderMapper;
import nl.saxion.disaster.deploymentservice.model.DeploymentOrder;
import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentOrderRepository;
import nl.saxion.disaster.deploymentservice.service.DeploymentOrderServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeploymentOrderServiceImplTest {

    @Mock
    private DeploymentOrderRepository orderRepository;

    @Mock
    private DeploymentOrderMapper orderMapper;

    @Mock
    private DeploymentEventPublisher eventPublisher;

    @InjectMocks
    private DeploymentOrderServiceImpl service;

    // =========================================================================
    // 1) EMPTY LIST CASE
    // =========================================================================
    @Test
    void getDeploymentOrdersByIncidentId_emptyList_returnsEmptyList() {

        Long incidentId = 100L;

        when(orderRepository.findDeploymentOrdersByIncidentId(incidentId))
                .thenReturn(Collections.emptyList());

        List<DeploymentOrderDTO> result =
                service.getDeploymentOrdersByIncidentId(incidentId);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(orderRepository).findDeploymentOrdersByIncidentId(incidentId);
        verify(orderMapper, never()).toDto(any());
    }

    // =========================================================================
    // 2) NON-EMPTY LIST CASE
    // =========================================================================
    @Test
    void getDeploymentOrdersByIncidentId_returnsMappedList() {

        Long incidentId = 200L;

        DeploymentOrder order = new DeploymentOrder();
        order.setDeploymentOrderId(1L);
        order.setIncidentId(incidentId);

        when(orderRepository.findDeploymentOrdersByIncidentId(incidentId))
                .thenReturn(List.of(order));

        DeploymentOrderDTO expectedDTO = new DeploymentOrderDTO();
        expectedDTO.setDeploymentOrderId(1L);
        expectedDTO.setIncidentId(incidentId);

        when(orderMapper.toDto(order)).thenReturn(expectedDTO);

        List<DeploymentOrderDTO> result =
                service.getDeploymentOrdersByIncidentId(incidentId);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getDeploymentOrderId());
        assertEquals(incidentId, result.get(0).getIncidentId());

        verify(orderRepository).findDeploymentOrdersByIncidentId(incidentId);
        verify(orderMapper).toDto(order);
    }

    // =========================================================================
    // 3) createDeploymentOrder() → should save, publish events and map result
    // =========================================================================
    @Test
    void createDeploymentOrder_success() {

        DeploymentOrderCreateDTO createDTO = TestData.createOrderCreateDTO();

        DeploymentOrder savedOrder = TestData.createFullDeploymentOrder();

        when(orderRepository.saveDeploymentOrder(any()))
                .thenReturn(savedOrder);

        DeploymentOrderDTO mappedDTO = new DeploymentOrderDTO();
        mappedDTO.setDeploymentOrderId(10L);
        mappedDTO.setIncidentId(savedOrder.getIncidentId());

        when(orderMapper.toDto(savedOrder)).thenReturn(mappedDTO);

        DeploymentOrderDTO result = service.createDeploymentOrder(createDTO);

        assertNotNull(result);
        assertEquals(10L, result.getDeploymentOrderId());
        assertEquals(createDTO.getIncidentId(), result.getIncidentId());

        verify(orderRepository).saveDeploymentOrder(any());
        verify(orderMapper).toDto(savedOrder);

        // publish once per deployment request
        verify(eventPublisher, times(2)).publish(any());
    }

    // =========================================================================
    // Helper Data
    // =========================================================================
    private static class TestData {

        static DeploymentOrderCreateDTO createOrderCreateDTO() {

            DeploymentOrderCreateDTO.Request req1 = new DeploymentOrderCreateDTO.Request();
            req1.setTargetDepartmentId(10L);
            req1.setRequestedUnitType(ResponseUnitType.FIRE_TRUCK);
            req1.setRequestedQuantity(1);

            DeploymentOrderCreateDTO.Request req2 = new DeploymentOrderCreateDTO.Request();
            req2.setTargetDepartmentId(20L);
            req2.setRequestedUnitType(ResponseUnitType.AMBULANCE);
            req2.setRequestedQuantity(2);

            DeploymentOrderCreateDTO dto = new DeploymentOrderCreateDTO();
            dto.setIncidentId(500L);
            dto.setOrderedBy(1000L);
            dto.setIncidentSeverity(IncidentSeverity.HIGH);
            dto.setNotes("TEST");
            dto.setDeploymentRequests(List.of(req1, req2));

            return dto;
        }

        static DeploymentOrder createFullDeploymentOrder() {

            DeploymentOrder order = new DeploymentOrder();
            order.setDeploymentOrderId(10L);
            order.setIncidentId(500L);

            DeploymentRequest r1 = new DeploymentRequest();
            r1.setRequestId(1L);
            r1.setTargetDepartmentId(10L);
            r1.setStatus(DeploymentRequestStatus.PENDING);

            DeploymentRequest r2 = new DeploymentRequest();
            r2.setRequestId(2L);
            r2.setTargetDepartmentId(20L);
            r2.setStatus(DeploymentRequestStatus.PENDING);

            order.setDeploymentRequests(List.of(r1, r2));

            return order;
        }
    }
}
