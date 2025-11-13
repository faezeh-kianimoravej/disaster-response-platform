package nl.saxion.disaster.deploymentservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.deploymentservice.client.ResourceLocationDTO;
import nl.saxion.disaster.deploymentservice.client.ResourceServiceClient;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitDTO;
import nl.saxion.disaster.deploymentservice.exception.ResourceNotFoundException;
import nl.saxion.disaster.deploymentservice.mapper.ResponseUnitMapper;
import nl.saxion.disaster.deploymentservice.model.ResponseUnit;
import nl.saxion.disaster.deploymentservice.repository.contract.ResponseUnitRepository;
import nl.saxion.disaster.deploymentservice.service.contract.ResponseUnitService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResponseUnitServiceImpl implements ResponseUnitService {

    private final ResponseUnitRepository responseUnitRepository;
    private final ResponseUnitMapper responseUnitMapper;
    private final ResourceServiceClient resourceServiceClient;

    @Override
    @Transactional
    public ResponseUnitDTO create(ResponseUnitCreateDTO dto) {
        ResponseUnit unit = new ResponseUnit();
        unit.setUnitName(dto.getUnitName());
        unit.setDepartmentId(dto.getDepartmentId());
        unit.setUnitType(dto.getUnitType());
        unit.setStatus(dto.getStatus());

        // Map default resources
        if (dto.getDefaultResources() != null) {
            List<ResponseUnit.DefaultResource> defaultResources = dto.getDefaultResources().stream()
                    .map(r -> {
                        ResponseUnit.DefaultResource resource = new ResponseUnit.DefaultResource();
                        resource.setResourceId(r.getResourceId());
                        resource.setQuantity(r.getQuantity());
                        resource.setIsPrimary(r.getIsPrimary());
                        return resource;
                    })
                    .collect(Collectors.toList());
            unit.setDefaultResources(defaultResources);
        }

        // Map default personnel
        if (dto.getDefaultPersonnel() != null) {
            List<ResponseUnit.DefaultPersonnelSlot> defaultPersonnel = dto.getDefaultPersonnel().stream()
                    .map(p -> {
                        ResponseUnit.DefaultPersonnelSlot personnel = new ResponseUnit.DefaultPersonnelSlot();
                        personnel.setUserId(p.getUserId());
                        personnel.setSpecialization(p.getSpecialization());
                        personnel.setIsRequired(p.getIsRequired());
                        return personnel;
                    })
                    .collect(Collectors.toList());
            unit.setDefaultPersonnel(defaultPersonnel);
        }

        // Fetch and set location from primary resource
        if (dto.getDefaultResources() != null && !dto.getDefaultResources().isEmpty()) {
            dto.getDefaultResources().stream()
                    .filter(r -> r.getIsPrimary())
                    .findFirst()
                    .ifPresent(primaryResource -> {
                        try {
                            ResourceLocationDTO resource = resourceServiceClient.getResourceLocationById(primaryResource.getResourceId());
                            unit.setLatitude(resource.getLatitude());
                            unit.setLongitude(resource.getLongitude());
                            unit.setLastLocationUpdate(LocalDateTime.now());
                            log.debug("Successfully fetched location from primary resource {} for response unit {}", 
                                    primaryResource.getResourceId(), dto.getUnitName());
                        } catch (Exception e) {
                            log.warn("Failed to fetch location from primary resource {} for response unit {}. Location will be updated later. Error: {}", 
                                    primaryResource.getResourceId(), dto.getUnitName(), e.getMessage());
                        }
                    });
        }

        ResponseUnit saved = responseUnitRepository.save(unit);
        return responseUnitMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseUnitDTO getById(Long unitId) {
        ResponseUnit unit = responseUnitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Response unit", unitId));
        return responseUnitMapper.toDto(unit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResponseUnitDTO> getByDepartmentId(Long departmentId) {
        List<ResponseUnit> units = responseUnitRepository.findByDepartmentId(departmentId);
        return units.stream()
                .map(responseUnitMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResponseUnitDTO> getAll() {
        List<ResponseUnit> units = responseUnitRepository.findAll();
        return units.stream()
                .map(responseUnitMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ResponseUnitDTO update(Long unitId, ResponseUnitCreateDTO dto) {
        ResponseUnit unit = responseUnitRepository.findById(unitId)
                .orElseThrow(() -> new ResourceNotFoundException("Response unit", unitId));

        unit.setUnitName(dto.getUnitName());
        unit.setDepartmentId(dto.getDepartmentId());
        unit.setUnitType(dto.getUnitType());
        unit.setStatus(dto.getStatus());

        // Update default resources
        if (dto.getDefaultResources() != null) {
            List<ResponseUnit.DefaultResource> defaultResources = dto.getDefaultResources().stream()
                    .map(r -> {
                        ResponseUnit.DefaultResource resource = new ResponseUnit.DefaultResource();
                        resource.setResourceId(r.getResourceId());
                        resource.setQuantity(r.getQuantity());
                        resource.setIsPrimary(r.getIsPrimary());
                        return resource;
                    })
                    .collect(Collectors.toList());
            unit.setDefaultResources(defaultResources);
        }

        // Update default personnel
        if (dto.getDefaultPersonnel() != null) {
            List<ResponseUnit.DefaultPersonnelSlot> defaultPersonnel = dto.getDefaultPersonnel().stream()
                    .map(p -> {
                        ResponseUnit.DefaultPersonnelSlot personnel = new ResponseUnit.DefaultPersonnelSlot();
                        personnel.setUserId(p.getUserId());
                        personnel.setSpecialization(p.getSpecialization());
                        personnel.setIsRequired(p.getIsRequired());
                        return personnel;
                    })
                    .collect(Collectors.toList());
            unit.setDefaultPersonnel(defaultPersonnel);
        }

        ResponseUnit saved = responseUnitRepository.save(unit);
        return responseUnitMapper.toDto(saved);
    }

    @Override
    @Transactional
    public void delete(Long unitId) {
        if (!responseUnitRepository.existsById(unitId)) {
            throw new ResourceNotFoundException("Response unit", unitId);
        }
        responseUnitRepository.deleteById(unitId);
    }
}
