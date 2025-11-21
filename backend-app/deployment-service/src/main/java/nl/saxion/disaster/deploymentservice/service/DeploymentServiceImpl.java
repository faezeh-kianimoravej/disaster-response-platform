package nl.saxion.disaster.deploymentservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeploymentServiceImpl implements DeploymentService {

    private final DeploymentRequestRepository requestRepository;
    private final ResponseUnitRepository responseUnitRepository;
    private final DeploymentRepository deploymentRepository;

    @Override
    @Transactional
    public DeploymentAssignResponseDTO allocateUnitsForDeploymentRequest(Long requestId, DeploymentAssignRequestDTO dto) {

        // 1) Load DeploymentRequest
        DeploymentRequest deploymentRequest = requestRepository.findDeploymentRequestById(requestId)
                .orElseThrow(() -> new RuntimeException("DeploymentRequest not found with id: " + requestId));

        log.info("Allocating units for DeploymentRequest id={} (incidentId={}, departmentId={}, requestedQuantity={})",
                deploymentRequest.getRequestId(),
                deploymentRequest.getIncidentId(),
                deploymentRequest.getTargetDepartmentId(),
                deploymentRequest.getRequestedQuantity()
        );

        // 2) Load candidate AVAILABLE units from same department and type
        List<ResponseUnit> candidates =
                responseUnitRepository.findResponseUnitByDepartmentIdAndUnitTypeAndStatus(
                        deploymentRequest.getTargetDepartmentId(),
                        deploymentRequest.getRequestedUnitType(),
                        ResponseUnitStatus.AVAILABLE
                );

        if (candidates == null || candidates.isEmpty()) {
            log.info("No AVAILABLE units found for departmentId={} and unitType={}",
                    deploymentRequest.getTargetDepartmentId(),
                    deploymentRequest.getRequestedUnitType());
            return handleNoAssignableUnits(deploymentRequest, dto);
        }

        // 3) Filter valid units (personnel + resources)
        List<ResponseUnit> validUnits = filterValidResponseUnits(candidates);

        if (validUnits.isEmpty()) {
            log.info("No VALID units found after personnel/resources validation for requestId={}", requestId);
            return handleNoAssignableUnits(deploymentRequest, dto);
        }

        // 4) Determine how many units we can assign
        int needed = deploymentRequest.getRequestedQuantity();
        int canAssign = Math.min(needed, validUnits.size());

        log.info("DeploymentRequest id={} needs {} units, can assign {}", requestId, needed, canAssign);

        List<Deployment> deployments = new ArrayList<>();

        // 5) Create Deployments and update units
        for (int i = 0; i < canAssign; i++) {
            ResponseUnit unit = validUnits.get(i);

            log.debug("Assigning ResponseUnit id={} to DeploymentRequest id={}", unit.getUnitId(), requestId);

            Deployment deployment = buildDeployment(unit, deploymentRequest, dto);
            deploymentRepository.createDeployment(deployment);

            // Update ResponseUnit
            unit.setStatus(ResponseUnitStatus.DEPLOYED);
            unit.setCurrentDeploymentId(deployment.getDeploymentId());
            responseUnitRepository.save(unit);  // uses @Version for optimistic locking

            deployments.add(deployment);
        }

        // 6) Update Request Status
        updateRequestStatus(deploymentRequest, needed, canAssign, dto);
        requestRepository.saveDeploymentRequest(deploymentRequest);

        // 7) Build Response DTO
        return buildResponseDTO(deploymentRequest, deployments);
    }

    // ---------------------------------------------------------
    // VALIDATION HELPERS
    // ---------------------------------------------------------

    private List<ResponseUnit> filterValidResponseUnits(List<ResponseUnit> units) {
        if (units == null || units.isEmpty()) return Collections.emptyList();

        return units.stream()
                .filter(this::hasRequiredPersonnel)
                .filter(this::hasPrimaryResources)
                .collect(Collectors.toList());
    }

    private boolean hasRequiredPersonnel(ResponseUnit unit) {

        if (unit.getDefaultPersonnel() == null || unit.getDefaultPersonnel().isEmpty()) {
            return true;
        }

        if (unit.getCurrentPersonnel() == null || unit.getCurrentPersonnel().isEmpty()) {
            return false;
        }

        Set<ResponderSpecialization> currentSpecs = unit.getCurrentPersonnel()
                .stream()
                .map(ResponseUnit.CurrentPersonnel::getSpecialization)
                .collect(Collectors.toSet());

        for (ResponseUnit.DefaultPersonnelSlot slot : unit.getDefaultPersonnel()) {

            if (Boolean.TRUE.equals(slot.getIsRequired())
                    && !currentSpecs.contains(slot.getSpecialization())) {
                log.debug("Unit id={} failed personnel requirement: missing specialization {}",
                        unit.getUnitId(), slot.getSpecialization());
                return false;
            }
        }

        return true;
    }

    private boolean hasPrimaryResources(ResponseUnit unit) {

        if (unit.getDefaultResources() == null || unit.getDefaultResources().isEmpty()) {
            return true;
        }

        if (unit.getCurrentResources() == null || unit.getCurrentResources().isEmpty()) {
            return false;
        }

        Map<Long, Integer> currentResourceMap = unit.getCurrentResources()
                .stream()
                .collect(Collectors.toMap(
                        ResponseUnit.CurrentResource::getResourceId,
                        ResponseUnit.CurrentResource::getQuantity
                ));

        for (ResponseUnit.DefaultResource def : unit.getDefaultResources()) {

            if (Boolean.TRUE.equals(def.getIsPrimary())) {

                Integer currentQty = currentResourceMap.get(def.getResourceId());
                int requiredQty = (def.getRequiredQuantity() != null && def.getRequiredQuantity() > 0)
                        ? def.getRequiredQuantity()
                        : 1;

                if (currentQty == null || currentQty < requiredQty) {
                    log.debug("Unit id={} failed resource requirement: resourceId={} currentQty={} requiredQty={}",
                            unit.getUnitId(), def.getResourceId(), currentQty, requiredQty);
                    return false;
                }
            }
        }

        return true;
    }

    // ---------------------------------------------------------
    // BUILD DEPLOYMENT
    // ---------------------------------------------------------

    private Deployment buildDeployment(ResponseUnit unit, DeploymentRequest request, DeploymentAssignRequestDTO dto) {

        Deployment deployment = new Deployment();

        LocalDateTime requestedAt;

        if (request.getRequestedAt() != null) {
            requestedAt = request.getRequestedAt().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();
        } else {
            requestedAt = LocalDateTime.now();
        }


        deployment.setDeploymentRequestId(request.getRequestId());
        deployment.setIncidentId(request.getIncidentId());
        deployment.setResponseUnitId(unit.getUnitId());
        deployment.setStatus(DeploymentStatus.ASSIGNED);
        deployment.setAssignedAt(LocalDateTime.now());
        deployment.setOrderedAt(requestedAt);
        deployment.setNotes(dto.getNotes());

        // snapshot CURRENT resources
        if (unit.getCurrentResources() != null) {
            List<Deployment.DeployedResource> resourceSnapshot =
                    unit.getCurrentResources()
                            .stream()
                            .map(r -> {
                                Deployment.DeployedResource dr = new Deployment.DeployedResource();
                                dr.setResourceId(r.getResourceId());
                                dr.setQuantity(r.getQuantity());
                                return dr;
                            })
                            .collect(Collectors.toList());
            deployment.setDeployedResources(resourceSnapshot);
        } else {
            deployment.setDeployedResources(Collections.emptyList());
        }

        // snapshot CURRENT personnel
        if (unit.getCurrentPersonnel() != null) {
            List<Deployment.DeployedPersonnel> personnelSnapshot =
                    unit.getCurrentPersonnel()
                            .stream()
                            .map(p -> {
                                Deployment.DeployedPersonnel dp = new Deployment.DeployedPersonnel();
                                dp.setUserId(p.getUserId());
                                dp.setSpecialization(p.getSpecialization());
                                return dp;
                            })
                            .collect(Collectors.toList());
            deployment.setDeployedPersonnel(personnelSnapshot);
        } else {
            deployment.setDeployedPersonnel(Collections.emptyList());
        }

        return deployment;
    }

    // ---------------------------------------------------------
    // UPDATE REQUEST STATUS
    // ---------------------------------------------------------

    private void updateRequestStatus(
            DeploymentRequest request,
            int needed,
            int assigned,
            DeploymentAssignRequestDTO dto
    ) {
        if (assigned == 0) {
            request.setStatus(DeploymentRequestStatus.DECLINED);
        } else if (assigned < needed) {
            request.setStatus(DeploymentRequestStatus.PARTIALLY_ASSIGNED);
        } else {
            request.setStatus(DeploymentRequestStatus.ASSIGNED);
        }

        LocalDateTime now = LocalDateTime.now();
        request.setAssignedAt(Date.from(now.atZone(ZoneId.systemDefault()).toInstant()));
        request.setAssignedBy(dto.getAssignedBy());
        request.setNotes(dto.getNotes());
    }

    // ---------------------------------------------------------
    // RESPONSE BUILDERS
    // ---------------------------------------------------------

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
        fillStatusMessage(request, dto);

        List<DeploymentSummaryDTO> summaries = deployments.stream()
                .map(d -> {
                    DeploymentSummaryDTO s = new DeploymentSummaryDTO();
                    s.setDeploymentId(d.getDeploymentId());
                    s.setResponseUnitId(d.getResponseUnitId());
                    s.setDeploymentAssignedAt(d.getAssignedAt());
                    s.setDeploymentStatus(d.getStatus().name());
                    return s;
                })
                .collect(Collectors.toList());

        dto.setDeployments(summaries);

        return dto;
    }

    private void fillStatusMessage(DeploymentRequest request, DeploymentAssignResponseDTO dto) {

        if (request.getStatus() == null) {
            dto.setStatusMessage("");
            return;
        }

        switch (request.getStatus()) {
            case DECLINED:
                dto.setStatusMessage(
                        "This request was declined because no valid response units were available for deployment."
                );
                break;

            case PARTIALLY_ASSIGNED:
                dto.setStatusMessage(
                        "The request was partially fulfilled due to limited available units."
                );
                break;

            case ASSIGNED:
                dto.setStatusMessage(
                        "The deployment request has been fully satisfied. All units were assigned."
                );
                break;

            default:
                dto.setStatusMessage("");
        }
    }

    private DeploymentAssignResponseDTO handleNoAssignableUnits(
            DeploymentRequest request,
            DeploymentAssignRequestDTO dto
    ) {
        // If → assigned=0
        updateRequestStatus(request, request.getRequestedQuantity(), 0, dto);
        requestRepository.saveDeploymentRequest(request);

        return buildResponseDTO(request, Collections.emptyList());
    }
}
