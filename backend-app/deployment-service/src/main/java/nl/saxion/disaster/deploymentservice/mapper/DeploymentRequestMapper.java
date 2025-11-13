package nl.saxion.disaster.deploymentservice.mapper;

import nl.saxion.disaster.deploymentservice.dto.DeploymentRequestDTO;
import nl.saxion.disaster.deploymentservice.model.DeploymentOrder;
import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;
import org.springframework.stereotype.Component;

@Component
public class DeploymentRequestMapper implements BaseMapper<DeploymentRequest, DeploymentRequestDTO> {

    @Override
    public DeploymentRequestDTO toDto(DeploymentRequest entity) {
        if (entity == null) return null;

        DeploymentRequestDTO dto = new DeploymentRequestDTO();
        dto.setRequestId(entity.getRequestId());
        dto.setIncidentId(entity.getIncidentId());
        dto.setDeploymentOrderId(
                entity.getDeploymentOrder() != null ? entity.getDeploymentOrder().getDeploymentOrderId() : null
        );
        dto.setRequestedBy(entity.getRequestedBy());
        dto.setRequestedAt(entity.getRequestedAt());

        dto.setTargetDepartmentId(entity.getTargetDepartmentId());
        dto.setPriority(entity.getPriority());
        dto.setRequestedUnitType(entity.getRequestedUnitType());
        dto.setRequestedQuantity(entity.getRequestedQuantity());

        dto.setAssignedUnitId(entity.getAssignedUnitId());
        dto.setAssignedBy(entity.getAssignedBy());
        dto.setAssignedAt(entity.getAssignedAt());

        dto.setStatus(entity.getStatus());
        dto.setNotes(entity.getNotes());
        return dto;
    }

    @Override
    public DeploymentRequest toEntity(DeploymentRequestDTO dto) {
        if (dto == null) return null;

        DeploymentRequest entity = new DeploymentRequest();
        entity.setRequestId(dto.getRequestId());
        entity.setIncidentId(dto.getIncidentId());
        entity.setRequestedBy(dto.getRequestedBy());
        entity.setRequestedAt(dto.getRequestedAt());

        entity.setTargetDepartmentId(dto.getTargetDepartmentId());
        entity.setPriority(dto.getPriority());
        entity.setRequestedUnitType(dto.getRequestedUnitType());
        entity.setRequestedQuantity(dto.getRequestedQuantity());

        entity.setAssignedUnitId(dto.getAssignedUnitId());
        entity.setAssignedBy(dto.getAssignedBy());
        entity.setAssignedAt(dto.getAssignedAt());

        entity.setStatus(dto.getStatus());
        entity.setNotes(dto.getNotes());

        if (dto.getDeploymentOrderId() != null) {
            DeploymentOrder order = new DeploymentOrder();
            order.setDeploymentOrderId(dto.getDeploymentOrderId());
            entity.setDeploymentOrder(order);
        }
        return entity;
    }
}
