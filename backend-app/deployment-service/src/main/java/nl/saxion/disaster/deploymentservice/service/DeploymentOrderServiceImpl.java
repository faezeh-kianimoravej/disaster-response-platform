package nl.saxion.disaster.deploymentservice.service;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderDTO;
import nl.saxion.disaster.deploymentservice.mapper.DeploymentOrderMapper;
import nl.saxion.disaster.deploymentservice.model.DeploymentOrder;
import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;
import nl.saxion.disaster.deploymentservice.enums.DeploymentRequestStatus;
import nl.saxion.disaster.deploymentservice.repository.contract.DeploymentOrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DeploymentOrderServiceImpl implements nl.saxion.disaster.deploymentservice.service.contract.DeploymentOrderService {

    private final DeploymentOrderRepository orderRepository;
    private final DeploymentOrderMapper orderMapper;

    @Override
    @Transactional
    public DeploymentOrderDTO create(DeploymentOrderCreateDTO dto) {
        DeploymentOrder order = new DeploymentOrder();
        order.setIncidentId(dto.getIncidentId());
        order.setOrderedBy(dto.getOrderedBy());
        order.setOrderedAt(new Date());
        order.setIncidentSeverity(dto.getIncidentSeverity());
        order.setNotes(dto.getNotes());

        List<DeploymentRequest> requests = new ArrayList<>();
        Date now = new Date();
        dto.getDeploymentRequests().forEach(rq -> {
            DeploymentRequest r = new DeploymentRequest();
            r.setIncidentId(dto.getIncidentId());
            r.setDeploymentOrder(order);
            r.setRequestedBy(dto.getOrderedBy());
            r.setRequestedAt(now);
            r.setTargetDepartmentId(rq.getTargetDepartmentId());
            r.setPriority(dto.getIncidentSeverity());
            r.setRequestedUnitType(rq.getRequestedUnitType());
            r.setRequestedQuantity(rq.getRequestedQuantity());
            r.setStatus(DeploymentRequestStatus.PENDING);
            r.setNotes(dto.getNotes());
            requests.add(r);
        });
        order.setDeploymentRequests(requests);

        DeploymentOrder saved = orderRepository.save(order);
        return orderMapper.toDto(saved);
    }
}
