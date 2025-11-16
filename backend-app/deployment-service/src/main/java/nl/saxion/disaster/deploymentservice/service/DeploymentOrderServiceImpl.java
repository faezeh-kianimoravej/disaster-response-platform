package nl.saxion.disaster.deploymentservice.service;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderDTO;
import nl.saxion.disaster.deploymentservice.enums.DeploymentRequestStatus;
import nl.saxion.disaster.deploymentservice.event.DeploymentEventPublisher;
import nl.saxion.disaster.deploymentservice.mapper.DeploymentOrderMapper;
import nl.saxion.disaster.deploymentservice.model.DeploymentOrder;
import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentOrderRepository;
import nl.saxion.disaster.shared.event.NewDeploymentRequestEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeploymentOrderServiceImpl implements nl.saxion.disaster.deploymentservice.service.contract.DeploymentOrderService {

    private final DeploymentOrderRepository orderRepository;
    private final DeploymentOrderMapper orderMapper;
    private final DeploymentEventPublisher eventPublisher;

    @Override
    @Transactional
    public DeploymentOrderDTO createDeploymentOrder(DeploymentOrderCreateDTO dto) {

        // ------------------------------
        // 1) Build DeploymentOrder object
        // ------------------------------
        DeploymentOrder order = new DeploymentOrder();
        order.setIncidentId(dto.getIncidentId());
        order.setOrderedBy(dto.getOrderedBy());
        order.setOrderedAt(new Date());
        order.setIncidentSeverity(dto.getIncidentSeverity());
        order.setNotes(dto.getNotes());

        List<DeploymentRequest> requests = new ArrayList<>();
        Date currentDate = new Date();

        dto.getDeploymentRequests().forEach(request -> {
            DeploymentRequest deploymentRequest = new DeploymentRequest();
            deploymentRequest.setIncidentId(dto.getIncidentId());
            deploymentRequest.setDeploymentOrder(order);
            deploymentRequest.setRequestedBy(dto.getOrderedBy());
            deploymentRequest.setRequestedAt(currentDate);
            deploymentRequest.setTargetDepartmentId(request.getTargetDepartmentId());
            deploymentRequest.setPriority(dto.getIncidentSeverity());
            deploymentRequest.setRequestedUnitType(request.getRequestedUnitType());
            deploymentRequest.setRequestedQuantity(request.getRequestedQuantity());
            deploymentRequest.setStatus(DeploymentRequestStatus.PENDING);
            deploymentRequest.setNotes(dto.getNotes());

            requests.add(deploymentRequest);
        });

        order.setDeploymentRequests(requests);

        DeploymentOrder savedOrder = orderRepository.saveDeploymentOrder(order);

        // ------------------------------
        // 3) Publish events
        // ------------------------------
        savedOrder.getDeploymentRequests().forEach(req -> {

            NewDeploymentRequestEvent event = NewDeploymentRequestEvent.builder()
                    .deploymentRequestId(req.getRequestId())
                    .departmentId(req.getTargetDepartmentId())
                    .incidentId(savedOrder.getIncidentId())
                    .createdAt(Instant.now())
                    .description("A new deployment request was created for Incident #" + savedOrder.getIncidentId())
                    .build();

            eventPublisher.publish(event);
        });

        // ------------------------------
        // 4) Return response
        // ------------------------------
        return orderMapper.toDto(savedOrder);
    }


    @Override
    @Transactional(readOnly = true)
    public DeploymentOrderDTO getDeploymentOrderByIncidentId(Long incidentId) {
        DeploymentOrder order = orderRepository.findDeploymentOrderByIncidentId(incidentId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Deployment order not found for incident ID: " + incidentId));

        return orderMapper.toDto(order);
    }
}
