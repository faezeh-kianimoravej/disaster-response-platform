package nl.saxion.disaster.deploymentservice.mapper;

import nl.saxion.disaster.deploymentservice.dto.DeploymentDTO;
import nl.saxion.disaster.deploymentservice.model.Deployment;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class DeploymentMapper implements BaseMapper<Deployment, DeploymentDTO> {

    @Override
    public DeploymentDTO toDto(Deployment entity) {
        if (entity == null) return null;

        DeploymentDTO dto = new DeploymentDTO();
        dto.setDeploymentId(entity.getDeploymentId());
        dto.setIncidentId(entity.getIncidentId());
        dto.setDeploymentRequestId(entity.getDeploymentRequestId());
        dto.setResponseUnitId(entity.getResponseUnitId());
        dto.setStatus(entity.getStatus());

        dto.setDeployedResources(mapDeployedResourcesToDto(entity.getDeployedResources()));
        dto.setDeployedPersonnel(mapDeployedPersonnelToDto(entity.getDeployedPersonnel()));

        dto.setOrderedAt(entity.getOrderedAt());
        dto.setAssignedAt(entity.getAssignedAt());
        dto.setAcknowledgedAt(entity.getAcknowledgedAt());
        dto.setDispatchedAt(entity.getDispatchedAt());
        dto.setArrivedAt(entity.getArrivedAt());
        dto.setCompletedAt(entity.getCompletedAt());

        dto.setCurrentLatitude(entity.getCurrentLatitude());
        dto.setCurrentLongitude(entity.getCurrentLongitude());
        dto.setEstimatedArrival(entity.getEstimatedArrival());

        dto.setConsumedResources(mapConsumedResourcesToDto(entity.getConsumedResources()));
        dto.setNotes(entity.getNotes());
        return dto;
    }

    @Override
    public Deployment toEntity(DeploymentDTO dto) {
        if (dto == null) return null;

        Deployment entity = new Deployment();
        entity.setDeploymentId(dto.getDeploymentId());
        entity.setIncidentId(dto.getIncidentId());
        entity.setDeploymentRequestId(dto.getDeploymentRequestId());
        entity.setResponseUnitId(dto.getResponseUnitId());
        entity.setStatus(dto.getStatus());

        entity.setDeployedResources(mapDeployedResourcesToEntity(dto.getDeployedResources()));
        entity.setDeployedPersonnel(mapDeployedPersonnelToEntity(dto.getDeployedPersonnel()));

        entity.setOrderedAt(dto.getOrderedAt());
        entity.setAssignedAt(dto.getAssignedAt());
        entity.setAcknowledgedAt(dto.getAcknowledgedAt());
        entity.setDispatchedAt(dto.getDispatchedAt());
        entity.setArrivedAt(dto.getArrivedAt());
        entity.setCompletedAt(dto.getCompletedAt());

        entity.setCurrentLatitude(dto.getCurrentLatitude());
        entity.setCurrentLongitude(dto.getCurrentLongitude());
        entity.setEstimatedArrival(dto.getEstimatedArrival());

        entity.setConsumedResources(mapConsumedResourcesToEntity(dto.getConsumedResources()));
        entity.setNotes(dto.getNotes());
        return entity;
    }

    private List<DeploymentDTO.DeployedResourceDTO> mapDeployedResourcesToDto(List<Deployment.DeployedResource> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(r -> {
            DeploymentDTO.DeployedResourceDTO d = new DeploymentDTO.DeployedResourceDTO();
            d.setResourceId(r.getResourceId());
            d.setQuantity(r.getQuantity());
            return d;
        }).collect(Collectors.toList());
    }

    private List<Deployment.DeployedResource> mapDeployedResourcesToEntity(List<DeploymentDTO.DeployedResourceDTO> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(d -> {
            Deployment.DeployedResource r = new Deployment.DeployedResource();
            r.setResourceId(d.getResourceId());
            r.setQuantity(d.getQuantity());
            return r;
        }).collect(Collectors.toList());
    }

    private List<DeploymentDTO.DeployedPersonnelDTO> mapDeployedPersonnelToDto(List<Deployment.DeployedPersonnel> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(p -> {
            DeploymentDTO.DeployedPersonnelDTO d = new DeploymentDTO.DeployedPersonnelDTO();
            d.setUserId(p.getUserId());
            d.setSpecialization(p.getSpecialization());
            return d;
        }).collect(Collectors.toList());
    }

    private List<Deployment.DeployedPersonnel> mapDeployedPersonnelToEntity(List<DeploymentDTO.DeployedPersonnelDTO> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(d -> {
            Deployment.DeployedPersonnel p = new Deployment.DeployedPersonnel();
            p.setUserId(d.getUserId());
            p.setSpecialization(d.getSpecialization());
            return p;
        }).collect(Collectors.toList());
    }

    private List<DeploymentDTO.ConsumedResourceDTO> mapConsumedResourcesToDto(List<Deployment.ConsumedResource> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(c -> {
            DeploymentDTO.ConsumedResourceDTO d = new DeploymentDTO.ConsumedResourceDTO();
            d.setResourceId(c.getResourceId());
            d.setQuantityUsed(c.getQuantityUsed());
            return d;
        }).collect(Collectors.toList());
    }

    private List<Deployment.ConsumedResource> mapConsumedResourcesToEntity(List<DeploymentDTO.ConsumedResourceDTO> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(d -> {
            Deployment.ConsumedResource c = new Deployment.ConsumedResource();
            c.setResourceId(d.getResourceId());
            c.setQuantityUsed(d.getQuantityUsed());
            return c;
        }).collect(Collectors.toList());
    }
}
