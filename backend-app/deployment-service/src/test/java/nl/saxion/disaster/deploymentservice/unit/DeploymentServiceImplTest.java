package nl.saxion.disaster.deploymentservice.unit;

import nl.saxion.disaster.deploymentservice.client.ResourceServiceClient;
import nl.saxion.disaster.deploymentservice.dto.*;
import nl.saxion.disaster.deploymentservice.enums.*;
import nl.saxion.disaster.deploymentservice.model.Deployment;
import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;
import nl.saxion.disaster.deploymentservice.model.ResponseUnit;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentRepository;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentRequestRepository;
import nl.saxion.disaster.deploymentservice.repository.contract.ResponseUnitRepository;
import nl.saxion.disaster.deploymentservice.service.DeploymentServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

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

    @Mock
    private ResourceServiceClient resourceServiceClient;

    @InjectMocks
    private DeploymentServiceImpl service;

    // =========================================================================
    // 1) SUCCESS CASE
    // =========================================================================
    @Test
    void allocateUnits_success() {

        Long requestId = 1L;
        Long unitId = 10L;

        DeploymentRequest req = buildRequest(requestId);
        when(requestRepository.findDeploymentRequestById(requestId))
                .thenReturn(Optional.of(req));

        ResponseUnit unit = mockUnit(unitId);
        when(responseUnitRepository.findById(unitId))
                .thenReturn(Optional.of(unit));

        // Capture deployment BEFORE saving
        ArgumentCaptor<Deployment> captor = ArgumentCaptor.forClass(Deployment.class);

        doAnswer(inv -> {
            Deployment d = inv.getArgument(0);
            d.setDeploymentId(77L);
            return null;
        }).when(deploymentRepository).createDeployment(captor.capture());

        DeploymentAssignRequestDTO dto = validDto(requestId, unitId);

        DeploymentAssignResponseDTO resp =
                service.allocateUnitsForDeploymentRequest(dto);

        // Response validation
        assertEquals("ASSIGNED", resp.getRequestStatus());
        assertEquals(requestId, resp.getRequestId());
        assertEquals(1, resp.getDeployments().size());

        Deployment d = captor.getValue();
        assertNotNull(d.getDeploymentId());
        assertEquals(unitId, d.getResponseUnitId());
        assertEquals(DeploymentStatus.ASSIGNED, d.getStatus());
        assertNotNull(d.getAssignedAt());
        assertNotNull(d.getOrderedAt());

        // Unit updated
        assertEquals(ResponseUnitStatus.DEPLOYED, unit.getStatus());
        assertEquals(77L, unit.getCurrentDeploymentId());
        assertEquals(1, unit.getCurrentPersonnel().size());
        assertEquals(1, unit.getCurrentResources().size());

        verify(resourceServiceClient).allocateResources(any());
        verify(responseUnitRepository).save(unit);
        verify(requestRepository).saveDeploymentRequest(any());
    }

    // =========================================================================
    // 2) REQUEST NOT FOUND
    // =========================================================================
    @Test
    void allocateUnits_requestNotFound() {

        Long requestId = 999L;

        when(requestRepository.findDeploymentRequestById(requestId))
                .thenReturn(Optional.empty());

        DeploymentAssignRequestDTO dto = validDto(requestId, 10L);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.allocateUnitsForDeploymentRequest(dto));

        assertTrue(ex.getMessage().contains("DeploymentRequest not found"));
        verifyNoInteractions(resourceServiceClient);
        verifyNoInteractions(deploymentRepository);
    }

    // =========================================================================
    // 3) UNIT NOT FOUND
    // =========================================================================
    @Test
    void allocateUnits_unitNotFound() {
        Long requestId = 1L;
        Long unitId = 10L;

        when(requestRepository.findDeploymentRequestById(requestId))
                .thenReturn(Optional.of(buildRequest(requestId)));

        when(responseUnitRepository.findById(unitId))
                .thenReturn(Optional.empty());

        DeploymentAssignRequestDTO dto = validDto(requestId, unitId);

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.allocateUnitsForDeploymentRequest(dto));

        assertTrue(ex.getMessage().contains("ResponseUnit not found"));

        verify(deploymentRepository, never()).createDeployment(any());
    }

    // =========================================================================
    // 4) WRONG UNIT (department, type, status)
    // =========================================================================
    @Test
    void allocateUnits_wrongUnitValidation() {

        Long requestId = 1L;
        Long unitId = 10L;

        DeploymentRequest req = buildRequest(requestId);
        when(requestRepository.findDeploymentRequestById(requestId))
                .thenReturn(Optional.of(req));

        // wrong department
        ResponseUnit u1 = mockUnit(unitId);
        u1.setDepartmentId(99L);
        when(responseUnitRepository.findById(unitId)).thenReturn(Optional.of(u1));

        RuntimeException ex1 = assertThrows(RuntimeException.class,
                () -> service.allocateUnitsForDeploymentRequest(validDto(requestId, unitId)));
        assertTrue(ex1.getMessage().contains("department"));

        // wrong type
        ResponseUnit u2 = mockUnit(unitId);
        u2.setUnitType(ResponseUnitType.AMBULANCE);
        when(responseUnitRepository.findById(unitId)).thenReturn(Optional.of(u2));

        RuntimeException ex2 = assertThrows(RuntimeException.class,
                () -> service.allocateUnitsForDeploymentRequest(validDto(requestId, unitId)));
        assertTrue(ex2.getMessage().contains("type mismatch"));

        // wrong status
        ResponseUnit u3 = mockUnit(unitId);
        u3.setStatus(ResponseUnitStatus.DEPLOYED);
        when(responseUnitRepository.findById(unitId)).thenReturn(Optional.of(u3));

        RuntimeException ex3 = assertThrows(RuntimeException.class,
                () -> service.allocateUnitsForDeploymentRequest(validDto(requestId, unitId)));
        assertTrue(ex3.getMessage().contains("not AVAILABLE"));
    }

    // =========================================================================
    // 5) MISSING PERSONNEL
    // =========================================================================
    @Test
    void allocateUnits_missingPersonnel() {

        Long requestId = 1L;
        Long unitId = 10L;

        DeploymentRequest req = buildRequest(requestId);
        when(requestRepository.findDeploymentRequestById(requestId)).thenReturn(Optional.of(req));

        ResponseUnit unit = mockUnit(unitId);
        when(responseUnitRepository.findById(unitId)).thenReturn(Optional.of(unit));

        DeploymentAssignRequestDTO dto = validDto(requestId, unitId);
        dto.getAssignedPersonnel().get(0).setSpecialization("DRIVER");

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> service.allocateUnitsForDeploymentRequest(dto));

        assertTrue(ex.getMessage().contains("Missing required specialization"));
        verify(deploymentRepository, never()).createDeployment(any());
    }

    // =========================================================================
    // 6) MISSING OR INSUFFICIENT RESOURCE
    // =========================================================================
    @Test
    void allocateUnits_resourceMissingOrLow() {

        Long requestId = 1L;
        Long unitId = 10L;

        DeploymentRequest req = buildRequest(requestId);
        when(requestRepository.findDeploymentRequestById(requestId)).thenReturn(Optional.of(req));

        ResponseUnit unit = mockUnit(unitId);
        when(responseUnitRepository.findById(unitId)).thenReturn(Optional.of(unit));

        // missing primary
        DeploymentAssignRequestDTO dto1 = validDto(requestId, unitId);
        dto1.getAllocatedResources().get(0).setResourceId(999L);

        RuntimeException ex1 = assertThrows(RuntimeException.class,
                () -> service.allocateUnitsForDeploymentRequest(dto1));

        assertTrue(ex1.getMessage().contains("Missing primary resource"));

        // insufficient
        DeploymentAssignRequestDTO dto2 = validDto(requestId, unitId);
        dto2.getAllocatedResources().get(0).setQuantity(0);

        RuntimeException ex2 = assertThrows(RuntimeException.class,
                () -> service.allocateUnitsForDeploymentRequest(dto2));

        assertTrue(ex2.getMessage().contains("insufficient"));
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private DeploymentRequest buildRequest(Long id) {
        DeploymentRequest r = new DeploymentRequest();
        r.setRequestId(id);
        r.setIncidentId(1000L);
        r.setRequestedUnitType(ResponseUnitType.FIRE_TRUCK);
        r.setTargetDepartmentId(1L);
        r.setRequestedQuantity(1);
        r.setRequestedAt(new Date());
        r.setStatus(DeploymentRequestStatus.PENDING);
        return r;
    }

    private ResponseUnit mockUnit(Long id) {
        ResponseUnit u = new ResponseUnit();
        u.setUnitId(id);
        u.setUnitType(ResponseUnitType.FIRE_TRUCK);
        u.setDepartmentId(1L);
        u.setStatus(ResponseUnitStatus.AVAILABLE);

        ResponseUnit.DefaultResource dr = new ResponseUnit.DefaultResource();
        dr.setResourceId(10L);
        dr.setIsPrimary(true);
        dr.setRequiredQuantity(1);
        u.setDefaultResources(List.of(dr));

        ResponseUnit.DefaultPersonnelSlot dp = new ResponseUnit.DefaultPersonnelSlot();
        dp.setId(1L);
        dp.setIsRequired(true);
        dp.setSpecialization(ResponderSpecialization.FIREFIGHTER);
        u.setDefaultPersonnel(List.of(dp));

        u.setCurrentResources(new ArrayList<>());
        u.setCurrentPersonnel(new ArrayList<>());

        return u;
    }

    private DeploymentAssignRequestDTO validDto(Long reqId, Long unitId) {

        DeploymentAssignRequestDTO dto = new DeploymentAssignRequestDTO();
        dto.setRequestId(reqId);
        dto.setAssignedBy(111L);
        dto.setAssignedUnitId(unitId);
        dto.setNotes("MANUAL ASSIGN");

        DeploymentAssignRequestDTO.AssignedPersonnelDTO p =
                new DeploymentAssignRequestDTO.AssignedPersonnelDTO();
        p.setSlotId(1L);
        p.setUserId(500L);
        p.setSpecialization("FIREFIGHTER");

        dto.setAssignedPersonnel(List.of(p));

        DeploymentAssignRequestDTO.AllocatedResourceDTO r =
                new DeploymentAssignRequestDTO.AllocatedResourceDTO();
        r.setResourceId(10L);
        r.setQuantity(1);
        r.setIsPrimary(true);

        dto.setAllocatedResources(List.of(r));

        return dto;
    }
}
