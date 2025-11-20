package nl.saxion.disaster.deploymentservice.service;

import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignRequestDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignResponseDTO;
import nl.saxion.disaster.deploymentservice.enums.*;
import nl.saxion.disaster.deploymentservice.model.Deployment;
import nl.saxion.disaster.deploymentservice.model.DeploymentOrder;
import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;
import nl.saxion.disaster.deploymentservice.model.ResponseUnit;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentRepository;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentRequestRepository;
import nl.saxion.disaster.deploymentservice.repository.contract.ResponseUnitRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeploymentServiceImplTest {

    @Mock
    private DeploymentRequestRepository requestRepository;

    @Mock
    private ResponseUnitRepository responseUnitRepository;

    @Mock
    private DeploymentRepository deploymentRepository;

    @InjectMocks
    private DeploymentServiceImpl deploymentService;

    // ------------------------------------------------------------------------
    // 1) Happy-path: successfully assigns 2 units (exactly enough)
    // ------------------------------------------------------------------------
    @Test
    void allocateUnits_successfullyAssignsTwoUnits() {
        // GIVEN
        Long requestId = 1001L;
        DeploymentRequest request = buildBaseRequest(requestId, 2);

        when(requestRepository.findDeploymentRequestById(requestId))
                .thenReturn(Optional.of(request));

        ResponseUnit unit1 = mockValidResponseUnit(1L);
        ResponseUnit unit2 = mockValidResponseUnit(2L);

        when(responseUnitRepository.findResponseUnitByDepartmentIdAndUnitTypeAndStatus(
                1L, ResponseUnitType.FIRE_TRUCK, ResponseUnitStatus.AVAILABLE))
                .thenReturn(Arrays.asList(unit1, unit2));

        mockDeploymentRepositoryAssignIds();

        DeploymentAssignRequestDTO dto = new DeploymentAssignRequestDTO();
        dto.setAssignedBy(123L);
        dto.setNotes("TEST");

        // WHEN
        DeploymentAssignResponseDTO response =
                deploymentService.allocateUnitsForDeploymentRequest(requestId, dto);

        // THEN
        assertEquals("ASSIGNED", response.getRequestStatus());
        assertEquals(2, response.getDeployments().size());

        verify(deploymentRepository, times(2)).createDeployment(any());
        verify(responseUnitRepository, times(2)).save(any());
        verify(requestRepository).saveDeploymentRequest(any());
    }

    // ------------------------------------------------------------------------
    // 2) Error: DeploymentRequest not found
    // ------------------------------------------------------------------------
    @Test
    void allocateUnits_throwsWhenRequestNotFound() {
        Long requestId = 999L;
        when(requestRepository.findDeploymentRequestById(requestId))
                .thenReturn(Optional.empty());

        DeploymentAssignRequestDTO dto = new DeploymentAssignRequestDTO();
        dto.setAssignedBy(123L);

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> deploymentService.allocateUnitsForDeploymentRequest(requestId, dto)
        );

        assertTrue(ex.getMessage().contains("DeploymentRequest not found with id: 999"));
        verifyNoInteractions(responseUnitRepository, deploymentRepository);
    }

    // ------------------------------------------------------------------------
    // 3) No AVAILABLE units → DECLINED, no deployments
    // ------------------------------------------------------------------------
    @Test
    void allocateUnits_noAvailableUnits_resultsInDeclinedRequest() {
        Long requestId = 1002L;
        DeploymentRequest request = buildBaseRequest(requestId, 2);

        when(requestRepository.findDeploymentRequestById(requestId))
                .thenReturn(Optional.of(request));
        
        when(responseUnitRepository.findResponseUnitByDepartmentIdAndUnitTypeAndStatus(
                1L, ResponseUnitType.FIRE_TRUCK, ResponseUnitStatus.AVAILABLE))
                .thenReturn(Collections.emptyList());

        when(requestRepository.saveDeploymentRequest(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DeploymentAssignRequestDTO dto = new DeploymentAssignRequestDTO();
        dto.setAssignedBy(123L);
        dto.setNotes("NO UNITS");

        DeploymentAssignResponseDTO response =
                deploymentService.allocateUnitsForDeploymentRequest(requestId, dto);

        assertEquals("DECLINED", response.getRequestStatus());
        assertTrue(response.getDeployments().isEmpty());

        verify(deploymentRepository, never()).createDeployment(any());
        verify(responseUnitRepository, never()).save(any());
        verify(requestRepository).saveDeploymentRequest(any());
    }

    // ------------------------------------------------------------------------
    // 4) Units exist but none passes validation (missing required personnel)
    // ------------------------------------------------------------------------
    @Test
    void allocateUnits_unitsFailValidation_resultsInDeclinedRequest() {
        Long requestId = 1003L;
        DeploymentRequest request = buildBaseRequest(requestId, 2);

        when(requestRepository.findDeploymentRequestById(requestId))
                .thenReturn(Optional.of(request));

        ResponseUnit invalidUnit1 = mockUnitMissingRequiredPersonnel(1L);
        ResponseUnit invalidUnit2 = mockUnitMissingRequiredPersonnel(2L);

        when(responseUnitRepository.findResponseUnitByDepartmentIdAndUnitTypeAndStatus(
                1L, ResponseUnitType.FIRE_TRUCK, ResponseUnitStatus.AVAILABLE))
                .thenReturn(Arrays.asList(invalidUnit1, invalidUnit2));

        when(requestRepository.saveDeploymentRequest(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DeploymentAssignRequestDTO dto = new DeploymentAssignRequestDTO();
        dto.setAssignedBy(123L);
        dto.setNotes("INVALID UNITS");

        DeploymentAssignResponseDTO response =
                deploymentService.allocateUnitsForDeploymentRequest(requestId, dto);

        assertEquals("DECLINED", response.getRequestStatus());
        assertTrue(response.getDeployments().isEmpty());

        verify(deploymentRepository, never()).createDeployment(any());
        verify(responseUnitRepository, never()).save(any());
        verify(requestRepository).saveDeploymentRequest(any());
    }

    // ------------------------------------------------------------------------
    // 5) Partial assignment: requested 3, can assign only 2 → PARTIALLY_ASSIGNED
    // ------------------------------------------------------------------------
    @Test
    void allocateUnits_partialAssignment_marksRequestPartiallyAssigned() {
        Long requestId = 1004L;
        DeploymentRequest request = buildBaseRequest(requestId, 3);

        when(requestRepository.findDeploymentRequestById(requestId))
                .thenReturn(Optional.of(request));

        ResponseUnit unit1 = mockValidResponseUnit(1L);
        ResponseUnit unit2 = mockValidResponseUnit(2L);

        // فقط ۲ واحد valid داریم
        when(responseUnitRepository.findResponseUnitByDepartmentIdAndUnitTypeAndStatus(
                1L, ResponseUnitType.FIRE_TRUCK, ResponseUnitStatus.AVAILABLE))
                .thenReturn(Arrays.asList(unit1, unit2));

        mockDeploymentRepositoryAssignIds();

        when(requestRepository.saveDeploymentRequest(any()))
                .thenAnswer(invocation -> invocation.getArgument(0));

        DeploymentAssignRequestDTO dto = new DeploymentAssignRequestDTO();
        dto.setAssignedBy(123L);
        dto.setNotes("PARTIAL");

        DeploymentAssignResponseDTO response =
                deploymentService.allocateUnitsForDeploymentRequest(requestId, dto);

        assertEquals("PARTIALLY_ASSIGNED", response.getRequestStatus());
        assertEquals(2, response.getDeployments().size());

        verify(deploymentRepository, times(2)).createDeployment(any());
        verify(responseUnitRepository, times(2)).save(any());
        verify(requestRepository).saveDeploymentRequest(any());
    }

    @Test
    void allocateUnits_handlesNullRequestedAtWithoutException() {
        Long requestId = 1005L;
        DeploymentRequest request = buildBaseRequest(requestId, 1);
        request.setRequestedAt(null);

        when(requestRepository.findDeploymentRequestById(requestId))
                .thenReturn(Optional.of(request));

        ResponseUnit unit1 = mockValidResponseUnit(1L);

        when(responseUnitRepository.findResponseUnitByDepartmentIdAndUnitTypeAndStatus(
                1L, ResponseUnitType.FIRE_TRUCK, ResponseUnitStatus.AVAILABLE))
                .thenReturn(List.of(unit1));

        ArgumentCaptor<Deployment> deploymentCaptor = ArgumentCaptor.forClass(Deployment.class);
        doAnswer(invocation -> {
            Deployment dep = invocation.getArgument(0);
            dep.setDeploymentId(42L);
            return dep;
        }).when(deploymentRepository).createDeployment(deploymentCaptor.capture());

        DeploymentAssignRequestDTO dto = new DeploymentAssignRequestDTO();
        dto.setAssignedBy(123L);
        dto.setNotes("NULL REQUESTED_AT");

        DeploymentAssignResponseDTO response =
                deploymentService.allocateUnitsForDeploymentRequest(requestId, dto);

        assertEquals("ASSIGNED", response.getRequestStatus());
        assertEquals(1, response.getDeployments().size());

        Deployment captured = deploymentCaptor.getValue();
        assertNotNull(captured.getOrderedAt(), "orderedAt should be set even if requestedAt was null");
        assertEquals(1L, captured.getResponseUnitId());

        verify(deploymentRepository, times(1)).createDeployment(any());
        verify(responseUnitRepository, times(1)).save(any());
        verify(requestRepository).saveDeploymentRequest(any());
    }

    // ========================================================================
    // Helpers
    // ========================================================================

    private DeploymentRequest buildBaseRequest(Long requestId, int requestedQuantity) {
        DeploymentOrder order = new DeploymentOrder();
        order.setDeploymentOrderId(5001L);
        order.setIncidentId(9001L);
        order.setOrderedBy(9999L);
        order.setOrderedAt(new Date());
        order.setIncidentSeverity(IncidentSeverity.HIGH);

        DeploymentRequest request = new DeploymentRequest();
        request.setRequestId(requestId);
        request.setIncidentId(9001L);
        request.setDeploymentOrder(order);
        request.setRequestedUnitType(ResponseUnitType.FIRE_TRUCK);
        request.setTargetDepartmentId(1L);
        request.setRequestedQuantity(requestedQuantity);
        request.setRequestedAt(new Date());
        request.setPriority(IncidentSeverity.HIGH);
        request.setStatus(DeploymentRequestStatus.PENDING);
        request.setRequestedBy(9999L);

        return request;
    }

    // Helper: valid unit (passes both personnel and resource validation)
    private ResponseUnit mockValidResponseUnit(Long id) {
        ResponseUnit u = new ResponseUnit();
        u.setUnitId(id);
        u.setUnitType(ResponseUnitType.FIRE_TRUCK);
        u.setDepartmentId(1L);
        u.setStatus(ResponseUnitStatus.AVAILABLE);

        // Default resources
        ResponseUnit.DefaultResource dr = new ResponseUnit.DefaultResource();
        dr.setIsPrimary(true);
        dr.setResourceId(10L);
        dr.setQuantity(1);
        dr.setRequiredQuantity(1);
        u.setDefaultResources(List.of(dr));

        // Current resources
        ResponseUnit.CurrentResource cr = new ResponseUnit.CurrentResource();
        cr.setResourceId(10L);
        cr.setQuantity(1);
        cr.setIsPrimary(true);
        u.setCurrentResources(List.of(cr));

        // Default personnel
        ResponseUnit.DefaultPersonnelSlot dp = new ResponseUnit.DefaultPersonnelSlot();
        dp.setId(1L);
        dp.setIsRequired(true);
        dp.setSpecialization(ResponderSpecialization.FIREFIGHTER);
        u.setDefaultPersonnel(List.of(dp));

        // Current personnel
        ResponseUnit.CurrentPersonnel cp = new ResponseUnit.CurrentPersonnel();
        cp.setUserId(999L);
        cp.setSpecialization(ResponderSpecialization.FIREFIGHTER);
        u.setCurrentPersonnel(List.of(cp));

        return u;
    }

    private ResponseUnit mockUnitMissingRequiredPersonnel(Long id) {
        ResponseUnit u = new ResponseUnit();
        u.setUnitId(id);
        u.setUnitType(ResponseUnitType.FIRE_TRUCK);
        u.setDepartmentId(1L);
        u.setStatus(ResponseUnitStatus.AVAILABLE);


        ResponseUnit.DefaultResource dr = new ResponseUnit.DefaultResource();
        dr.setIsPrimary(true);
        dr.setResourceId(10L);
        dr.setQuantity(1);
        dr.setRequiredQuantity(1);
        u.setDefaultResources(List.of(dr));

        // Current resources
        ResponseUnit.CurrentResource cr = new ResponseUnit.CurrentResource();
        cr.setResourceId(10L);
        cr.setQuantity(1);
        cr.setIsPrimary(true);
        u.setCurrentResources(List.of(cr));

        // Default personnel
        ResponseUnit.DefaultPersonnelSlot dp = new ResponseUnit.DefaultPersonnelSlot();
        dp.setId(1L);
        dp.setIsRequired(true);
        dp.setSpecialization(ResponderSpecialization.FIREFIGHTER);
        u.setDefaultPersonnel(List.of(dp));

        // currentPersonnel
        u.setCurrentPersonnel(Collections.emptyList());

        return u;
    }

    // Helper: mock createDeployment so it assigns unique IDs
    private void mockDeploymentRepositoryAssignIds() {
        final long[] seq = {1L};
        when(deploymentRepository.createDeployment(any()))
                .thenAnswer(invocation -> {
                    Deployment dep = invocation.getArgument(0);
                    dep.setDeploymentId(seq[0]++);
                    // just to be safe:
                    if (dep.getAssignedAt() == null) {
                        dep.setAssignedAt(LocalDateTime.now());
                    }
                    return dep;
                });
    }
}
