package nl.saxion.disaster.deploymentservice.mapper;

import nl.saxion.disaster.deploymentservice.dto.DeploymentOrderDTO;
import nl.saxion.disaster.deploymentservice.dto.DeploymentRequestDTO;
import nl.saxion.disaster.deploymentservice.model.DeploymentOrder;
import nl.saxion.disaster.deploymentservice.model.DeploymentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DeploymentOrderMapper implements BaseMapper<DeploymentOrder, DeploymentOrderDTO> {

    private final DeploymentRequestMapper requestMapper;

    @Override
    public DeploymentOrderDTO toDto(DeploymentOrder entity) {
        if (entity == null) return null;

        DeploymentOrderDTO dto = new DeploymentOrderDTO();
        dto.setDeploymentOrderId(entity.getDeploymentOrderId());
        dto.setIncidentId(entity.getIncidentId());
        dto.setOrderedBy(entity.getOrderedBy());
        dto.setOrderedAt(entity.getOrderedAt());
        dto.setIncidentSeverity(entity.getIncidentSeverity());
        dto.setGripLevel(entity.getGripLevel());
        dto.setInstructions(entity.getInstructions());

        List<DeploymentRequest> reqs = entity.getDeploymentRequests();
        dto.setDeploymentRequests(reqs == null
                ? Collections.emptyList()
                : reqs.stream().map(requestMapper::toDto).collect(Collectors.toList()));
        return dto;
    }

    @Override
    public DeploymentOrder toEntity(DeploymentOrderDTO dto) {
        if (dto == null) return null;

        DeploymentOrder entity = new DeploymentOrder();
        entity.setDeploymentOrderId(dto.getDeploymentOrderId());
        entity.setIncidentId(dto.getIncidentId());
        entity.setOrderedBy(dto.getOrderedBy());
        entity.setOrderedAt(dto.getOrderedAt());
        entity.setIncidentSeverity(dto.getIncidentSeverity());
        entity.setGripLevel(dto.getGripLevel());
        entity.setInstructions(dto.getInstructions());

        List<DeploymentRequestDTO> reqDtos = dto.getDeploymentRequests();
        entity.setDeploymentRequests(reqDtos == null
                ? Collections.emptyList()
                : reqDtos.stream().map(requestMapper::toEntity).collect(Collectors.toList()));
        return entity;
    }
}
