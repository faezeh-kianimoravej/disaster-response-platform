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
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

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

        dto.getDeploymentRequests().forEach(rq -> {
            DeploymentRequest r = new DeploymentRequest();
            r.setIncidentId(dto.getIncidentId());
            r.setDeploymentOrder(order);
            r.setRequestedBy(dto.getOrderedBy());
            r.setRequestedAt(currentDate);
            r.setTargetDepartmentId(rq.getTargetDepartmentId());
            r.setPriority(dto.getIncidentSeverity());
            r.setRequestedUnitType(rq.getRequestedUnitType());
            r.setRequestedQuantity(rq.getRequestedQuantity());
            r.setStatus(DeploymentRequestStatus.PENDING);
            r.setNotes(dto.getNotes());
            requests.add(r);
        });

        order.setDeploymentRequests(requests);

        // ------------------------------
        // 2) Save to DB (inside transaction)
        // ------------------------------
        DeploymentOrder savedDeploymentOrder = orderRepository.saveDeploymentOrder(order);

        // ------------------------------
        // 3) Publish events AFTER COMMIT
        // ------------------------------
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {

                savedDeploymentOrder.getDeploymentRequests().forEach(req -> {
                    NewDeploymentRequestEvent event = NewDeploymentRequestEvent.builder()
                            .deploymentRequestId(req.getRequestId())
                            .departmentId(req.getTargetDepartmentId())
                            .incidentId(savedDeploymentOrder.getIncidentId())
                            .createdAt(Instant.now())
                            .build();

                    eventPublisher.publish(event);
                });
            }
        });

        // Return response
        return orderMapper.toDto(savedDeploymentOrder);
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
