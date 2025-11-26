package nl.saxion.disaster.deploymentservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.deploymentservice.client.ResourceServiceClient;
import nl.saxion.disaster.deploymentservice.dto.ResourceAllocationBatchRequestDTO;
import nl.saxion.disaster.deploymentservice.dto.ResourceAllocationItemDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignRequestDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentAssignResponseDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentSummaryDTO;
import nl.saxion.disaster.deploymentservice.enums.DeploymentRequestStatus;
import nl.saxion.disaster.deploymentservice.enums.DeploymentStatus;
import nl.saxion.disaster.deploymentservice.enums.ResponderSpecialization;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitStatus;
import nl.saxion.disaster.deploymentservice.model.Deployment;
import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;
import nl.saxion.disaster.deploymentservice.model.ResponseUnit;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentRepository;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentRequestRepository;
import nl.saxion.disaster.deploymentservice.repository.contract.ResponseUnitRepository;
import nl.saxion.disaster.deploymentservice.service.contract.DeploymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeploymentServiceImpl implements DeploymentService {

    private final DeploymentRequestRepository requestRepository;
    private final ResponseUnitRepository responseUnitRepository;
    private final DeploymentRepository deploymentRepository;
    private final ResourceServiceClient resourceServiceClient;

    @Override
    @Transactional
    public DeploymentAssignResponseDTO allocateUnitsForDeploymentRequest(DeploymentAssignRequestDTO dto) {

        // ---------------------------------------------------------------------
        // 0) BASIC VALIDATION
        // ---------------------------------------------------------------------
        if (dto == null)
            throw new RuntimeException("Request body cannot be null.");

        if (dto.getRequestId() == null)
            throw new RuntimeException("requestId cannot be null.");

        if (dto.getAssignedUnitId() == null)
            throw new RuntimeException("assignedUnitId cannot be null.");

        if (dto.getAssignedPersonnel() == null || dto.getAssignedPersonnel().isEmpty())
            throw new RuntimeException("assignedPersonnel cannot be empty.");

        if (dto.getAllocatedResources() == null || dto.getAllocatedResources().isEmpty())
            throw new RuntimeException("allocatedResources cannot be empty.");

        // ---------------------------------------------------------------------
        // 1) LOAD REQUEST & UNIT
        // ---------------------------------------------------------------------
        DeploymentRequest deploymentRequest = requestRepository.findDeploymentRequestById(dto.getRequestId())
                .orElseThrow(() -> new RuntimeException("DeploymentRequest not found with id: " + dto.getRequestId()));

        log.info("Manual allocation for requestId={}, assignedUnitId={}",
                dto.getRequestId(), dto.getAssignedUnitId());

        ResponseUnit unit = responseUnitRepository.findById(dto.getAssignedUnitId())
                .orElseThrow(() -> new RuntimeException("ResponseUnit not found with id: " + dto.getAssignedUnitId()));

        // ---------------------------------------------------------------------
        // 2) VALIDATE BUSINESS RULES
        // ---------------------------------------------------------------------
        validateUnitMatchesRequest(unit, deploymentRequest);
        validateAssignedPersonnel(unit, dto);
        validateAllocatedResources(unit, dto);

        // ---------------------------------------------------------------------
        // 3) BUILD SNAPSHOT LISTS (MUTABLE) FOR CURRENT PERSONNEL/RESOURCES
        // ---------------------------------------------------------------------
        List<ResponseUnit.CurrentPersonnel> newPersonnel =
                new ArrayList<>(dto.getAssignedPersonnel().stream()
                        .map(p -> {
                            ResponseUnit.CurrentPersonnel cp = new ResponseUnit.CurrentPersonnel();
                            cp.setUserId(p.getUserId());
                            cp.setSpecialization(ResponderSpecialization.valueOf(p.getSpecialization()));
                            return cp;
                        })
                        .toList());

        List<ResponseUnit.CurrentResource> newResources =
                new ArrayList<>(dto.getAllocatedResources().stream()
                        .map(r -> {
                            ResponseUnit.CurrentResource cr = new ResponseUnit.CurrentResource();
                            cr.setResourceId(r.getResourceId());
                            cr.setQuantity(r.getQuantity());
                            cr.setIsPrimary(r.getIsPrimary());
                            return cr;
                        })
                        .toList());

        // ---------------------------------------------------------------------
        // 4) CREATE DEPLOYMENT SNAPSHOT (USES NEW SNAPSHOTS, NOT OLD STATE)
        // ---------------------------------------------------------------------
        Deployment deployment = buildManualDeployment(unit, deploymentRequest, dto, newPersonnel, newResources);
        deploymentRepository.createDeployment(deployment);
        Long deploymentId = deployment.getDeploymentId();

        log.info("Created deployment with id={} for requestId={} and unitId={}",
                deploymentId, deploymentRequest.getRequestId(), unit.getUnitId());

        // ---------------------------------------------------------------------
        // 5) CALL RESOURCE-SERVICE TO ALLOCATE REAL INVENTORY
        // ---------------------------------------------------------------------
        List<ResourceAllocationItemDTO> allocationItems =
                dto.getAllocatedResources().stream()
                        .map(r -> new ResourceAllocationItemDTO(r.getResourceId(), r.getQuantity()))
                        .toList();

        ResourceAllocationBatchRequestDTO allocationRequest =
                new ResourceAllocationBatchRequestDTO(
                        deploymentId,
                        unit.getUnitId(),
                        allocationItems
                );

        //resourceServiceClient.allocateResources(allocationRequest);
        log.info("Allocated resources in resource-service for deploymentId={}", deploymentId);

        // ---------------------------------------------------------------------
        // 6) UPDATE UNIT RUNTIME STATE (CURRENT SNAPSHOT + STATUS + DEPLOYMENT)
        // ---------------------------------------------------------------------
        unit.setCurrentPersonnel(newPersonnel);
        unit.setCurrentResources(newResources);
        unit.setCurrentDeploymentId(deploymentId);
        unit.setStatus(ResponseUnitStatus.DEPLOYED);
        responseUnitRepository.save(unit);

        // ---------------------------------------------------------------------
        // 7) UPDATE DEPLOYMENT REQUEST STATUS
        // ---------------------------------------------------------------------
        deploymentRequest.setStatus(DeploymentRequestStatus.ASSIGNED);
        deploymentRequest.setAssignedBy(dto.getAssignedBy());
        deploymentRequest.setAssignedAt(new Date());
        deploymentRequest.setNotes(dto.getNotes());
        requestRepository.saveDeploymentRequest(deploymentRequest);

        // ---------------------------------------------------------------------
        // 8) BUILD RESPONSE DTO
        // ---------------------------------------------------------------------
        return buildResponseDTO(deploymentRequest, List.of(deployment));
    }

    // ========================================================================
    // VALIDATION: UNIT
    // ========================================================================
    private void validateUnitMatchesRequest(ResponseUnit unit, DeploymentRequest request) {

        if (!Objects.equals(unit.getDepartmentId(), request.getTargetDepartmentId()))
            throw new RuntimeException("Unit department mismatch.");

        if (unit.getUnitType() != request.getRequestedUnitType())
            throw new RuntimeException("Unit type mismatch.");

        if (unit.getStatus() != ResponseUnitStatus.AVAILABLE)
            throw new RuntimeException("Unit is not AVAILABLE.");
    }

    // ========================================================================
    // VALIDATION: PERSONNEL
    // ========================================================================
    private void validateAssignedPersonnel(ResponseUnit unit, DeploymentAssignRequestDTO dto) {

        if (unit.getDefaultPersonnel() == null || unit.getDefaultPersonnel().isEmpty())
            return;

        List<String> assignedSpecs = dto.getAssignedPersonnel().stream()
                .map(p -> p.getSpecialization())
                .toList();

        for (ResponseUnit.DefaultPersonnelSlot slot : unit.getDefaultPersonnel()) {
            if (Boolean.TRUE.equals(slot.getIsRequired())) {
                if (!assignedSpecs.contains(slot.getSpecialization().name())) {
                    throw new RuntimeException("Missing required specialization: " + slot.getSpecialization());
                }
            }
        }
    }

    // ========================================================================
    // VALIDATION: RESOURCES
    // ========================================================================
    private void validateAllocatedResources(ResponseUnit unit, DeploymentAssignRequestDTO dto) {

        if (unit.getDefaultResources() == null || unit.getDefaultResources().isEmpty())
            return;

        for (ResponseUnit.DefaultResource def : unit.getDefaultResources()) {

            if (Boolean.TRUE.equals(def.getIsPrimary())) {

                var match = dto.getAllocatedResources().stream()
                        .filter(r -> Objects.equals(r.getResourceId(), def.getResourceId()))
                        .findFirst();

                if (match.isEmpty())
                    throw new RuntimeException("Missing primary resource " + def.getResourceId());

                int required = (def.getRequiredQuantity() != null) ? def.getRequiredQuantity() : 1;

                if (match.get().getQuantity() < required)
                    throw new RuntimeException("Resource " + def.getResourceId()
                            + " insufficient quantity. Required=" + required
                            + " Provided=" + match.get().getQuantity());
            }
        }
    }

    // ========================================================================
    // BUILD DEPLOYMENT SNAPSHOT
    // ========================================================================
    private Deployment buildManualDeployment(ResponseUnit unit,
                                             DeploymentRequest request,
                                             DeploymentAssignRequestDTO dto,
                                             List<ResponseUnit.CurrentPersonnel> personnelSnapshot,
                                             List<ResponseUnit.CurrentResource> resourceSnapshot) {

        Deployment deployment = new Deployment();

        LocalDateTime requestedAt = (request.getRequestedAt() != null)
                ? request.getRequestedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()
                : LocalDateTime.now();

        deployment.setDeploymentRequestId(request.getRequestId());
        deployment.setIncidentId(request.getIncidentId());
        deployment.setResponseUnitId(unit.getUnitId());
        deployment.setStatus(DeploymentStatus.ASSIGNED);
        deployment.setAssignedAt(LocalDateTime.now());
        deployment.setOrderedAt(requestedAt);
        deployment.setNotes(dto.getNotes());

        // RESOURCES SNAPSHOT (MUTABLE!)
        deployment.setDeployedResources(
                new ArrayList<>(resourceSnapshot.stream()
                        .map(r -> {
                            Deployment.DeployedResource dr = new Deployment.DeployedResource();
                            dr.setResourceId(r.getResourceId());
                            dr.setQuantity(r.getQuantity());
                            return dr;
                        })
                        .toList())
        );

        // PERSONNEL SNAPSHOT (MUTABLE!)
        deployment.setDeployedPersonnel(
                new ArrayList<>(personnelSnapshot.stream()
                        .map(p -> {
                            Deployment.DeployedPersonnel dp = new Deployment.DeployedPersonnel();
                            dp.setUserId(p.getUserId());
                            dp.setSpecialization(p.getSpecialization());
                            return dp;
                        })
                        .toList())
        );

        return deployment;
    }

    // ========================================================================
    // BUILD RESPONSE DTO
    // ========================================================================
    private DeploymentAssignResponseDTO buildResponseDTO(
            DeploymentRequest request,
            List<Deployment> deployments
    ) {
        DeploymentAssignResponseDTO dto = new DeploymentAssignResponseDTO();

        dto.setRequestId(request.getRequestId());
        dto.setRequestStatus(request.getStatus().name());
        dto.setRequestAssignedBy(request.getAssignedBy());
        dto.setRequestAssignedAt(request.getAssignedAt());
        dto.setNotes(request.getNotes());
        dto.setStatusMessage("The deployment request has been manually assigned.");

        dto.setDeployments(
                new ArrayList<>(deployments.stream()
                        .map(d -> {
                            DeploymentSummaryDTO s = new DeploymentSummaryDTO();
                            s.setDeploymentId(d.getDeploymentId());
                            s.setResponseUnitId(d.getResponseUnitId());
                            s.setDeploymentAssignedAt(d.getAssignedAt());
                            s.setDeploymentStatus(d.getStatus().name());
                            return s;
                        })
                        .toList())
        );

        return dto;
    }
}
