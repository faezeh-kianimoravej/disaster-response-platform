package nl.saxion.disaster.deploymentservice.mapper;

import nl.saxion.disaster.deploymentservice.dto.ResponseUnitDTO;
import nl.saxion.disaster.deploymentservice.model.ResponseUnit;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class ResponseUnitMapper implements BaseMapper<ResponseUnit, ResponseUnitDTO> {

    @Override
    public ResponseUnitDTO toDto(ResponseUnit entity) {
        if (entity == null) return null;

        ResponseUnitDTO dto = new ResponseUnitDTO();
        dto.setUnitId(entity.getUnitId());
        dto.setUnitName(entity.getUnitName());
        dto.setDepartmentId(entity.getDepartmentId());
        dto.setUnitType(entity.getUnitType());

        dto.setDefaultResources(mapDefaultResourcesToDto(entity.getDefaultResources()));
        dto.setDefaultPersonnel(mapDefaultPersonnelToDto(entity.getDefaultPersonnel()));
        dto.setCurrentResources(mapCurrentResourcesToDto(entity.getCurrentResources()));
        dto.setCurrentPersonnel(mapCurrentPersonnelToDto(entity.getCurrentPersonnel()));

        dto.setStatus(entity.getStatus());
        dto.setCurrentDeploymentId(entity.getCurrentDeploymentId());

        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setLastLocationUpdate(entity.getLastLocationUpdate());

        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    @Override
    public ResponseUnit toEntity(ResponseUnitDTO dto) {
        if (dto == null) return null;

        ResponseUnit entity = new ResponseUnit();
        entity.setUnitId(dto.getUnitId());
        entity.setUnitName(dto.getUnitName());
        entity.setDepartmentId(dto.getDepartmentId());
        entity.setUnitType(dto.getUnitType());

        entity.setDefaultResources(mapDefaultResourcesToEntity(dto.getDefaultResources()));
        entity.setDefaultPersonnel(mapDefaultPersonnelToEntity(dto.getDefaultPersonnel()));
        entity.setCurrentResources(mapCurrentResourcesToEntity(dto.getCurrentResources()));
        entity.setCurrentPersonnel(mapCurrentPersonnelToEntity(dto.getCurrentPersonnel()));

        entity.setStatus(dto.getStatus());
        entity.setCurrentDeploymentId(dto.getCurrentDeploymentId());

        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setLastLocationUpdate(dto.getLastLocationUpdate());
        // createdAt/updatedAt are managed by JPA; do not overwrite
        return entity;
    }

    private List<ResponseUnitDTO.DefaultResourceDTO> mapDefaultResourcesToDto(List<ResponseUnit.DefaultResource> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(r -> {
            ResponseUnitDTO.DefaultResourceDTO d = new ResponseUnitDTO.DefaultResourceDTO();
            d.setResourceId(r.getResourceId());
            d.setQuantity(r.getQuantity());
            d.setIsPrimary(r.getIsPrimary());
            return d;
        }).collect(Collectors.toList());
    }

    private List<ResponseUnit.DefaultResource> mapDefaultResourcesToEntity(List<ResponseUnitDTO.DefaultResourceDTO> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(d -> {
            ResponseUnit.DefaultResource r = new ResponseUnit.DefaultResource();
            r.setResourceId(d.getResourceId());
            r.setQuantity(d.getQuantity());
            r.setIsPrimary(d.getIsPrimary());
            return r;
        }).collect(Collectors.toList());
    }

    private List<ResponseUnitDTO.DefaultPersonnelSlotDTO> mapDefaultPersonnelToDto(List<ResponseUnit.DefaultPersonnelSlot> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(p -> {
            ResponseUnitDTO.DefaultPersonnelSlotDTO d = new ResponseUnitDTO.DefaultPersonnelSlotDTO();
            d.setUserId(p.getUserId());
            d.setSpecialization(p.getSpecialization());
            d.setIsRequired(p.getIsRequired());
            return d;
        }).collect(Collectors.toList());
    }

    private List<ResponseUnit.DefaultPersonnelSlot> mapDefaultPersonnelToEntity(List<ResponseUnitDTO.DefaultPersonnelSlotDTO> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(d -> {
            ResponseUnit.DefaultPersonnelSlot p = new ResponseUnit.DefaultPersonnelSlot();
            p.setUserId(d.getUserId());
            p.setSpecialization(d.getSpecialization());
            p.setIsRequired(d.getIsRequired());
            return p;
        }).collect(Collectors.toList());
    }

    private List<ResponseUnitDTO.CurrentResourceDTO> mapCurrentResourcesToDto(List<ResponseUnit.CurrentResource> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(r -> {
            ResponseUnitDTO.CurrentResourceDTO d = new ResponseUnitDTO.CurrentResourceDTO();
            d.setResourceId(r.getResourceId());
            d.setQuantity(r.getQuantity());
            d.setIsPrimary(r.getIsPrimary());
            return d;
        }).collect(Collectors.toList());
    }

    private List<ResponseUnit.CurrentResource> mapCurrentResourcesToEntity(List<ResponseUnitDTO.CurrentResourceDTO> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(d -> {
            ResponseUnit.CurrentResource r = new ResponseUnit.CurrentResource();
            r.setResourceId(d.getResourceId());
            r.setQuantity(d.getQuantity());
            r.setIsPrimary(d.getIsPrimary());
            return r;
        }).collect(Collectors.toList());
    }

    private List<ResponseUnitDTO.CurrentPersonnelDTO> mapCurrentPersonnelToDto(List<ResponseUnit.CurrentPersonnel> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(p -> {
            ResponseUnitDTO.CurrentPersonnelDTO d = new ResponseUnitDTO.CurrentPersonnelDTO();
            d.setUserId(p.getUserId());
            d.setSpecialization(p.getSpecialization());
            return d;
        }).collect(Collectors.toList());
    }

    private List<ResponseUnit.CurrentPersonnel> mapCurrentPersonnelToEntity(List<ResponseUnitDTO.CurrentPersonnelDTO> list) {
        if (list == null) return Collections.emptyList();
        return list.stream().map(d -> {
            ResponseUnit.CurrentPersonnel p = new ResponseUnit.CurrentPersonnel();
            p.setUserId(d.getUserId());
            p.setSpecialization(d.getSpecialization());
            return p;
        }).collect(Collectors.toList());
    }
}
