package nl.saxion.disaster.deploymentservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.deploymentservice.client.*;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitCreateDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitSearchRequestDTO;
import nl.saxion.disaster.deploymentservice.dto.ResponseUnitSearchResponseDTO;
import nl.saxion.disaster.deploymentservice.enums.ResponseUnitStatus;
import nl.saxion.disaster.deploymentservice.exception.ResourceNotFoundException;
import nl.saxion.disaster.deploymentservice.mapper.ResponseUnitMapper;
import nl.saxion.disaster.deploymentservice.model.ResponseUnit;
import nl.saxion.disaster.deploymentservice.repository.contract.ResponseUnitRepository;
import nl.saxion.disaster.deploymentservice.service.contract.ResponseUnitService;
import nl.saxion.disaster.deploymentservice.util.DistanceCalculator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResponseUnitServiceImpl implements ResponseUnitService {

    private final ResponseUnitRepository responseUnitRepository;
    private final ResponseUnitMapper responseUnitMapper;
    private final ResourceServiceClient resourceServiceClient;
    private final IncidentServiceClient incidentServiceClient;
    private final MunicipalityServiceClient municipalityServiceClient;
    private final DepartmentServiceClient departmentServiceClient;
    private final DistanceCalculator distanceCalculator;

    @Override
    @Transactional
    public ResponseUnitDTO create(ResponseUnitCreateDTO dto) {
        ResponseUnit unit = new ResponseUnit();
        unit.setUnitName(dto.getUnitName());
        unit.setDepartmentId(dto.getDepartmentId());
        unit.setUnitType(dto.getUnitType());
        unit.setStatus(dto.getStatus());

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

    @Override
    public List<ResponseUnitSearchResponseDTO> searchAvailableUnits(ResponseUnitSearchRequestDTO request) {
        log.info("Searching for available response units: unitType={}, departmentId={}, municipalityId={}, incidentId={}",
                request.getUnitType(), request.getDepartmentId(), request.getMunicipalityId(), request.getIncidentId());

        IncidentLocationDTO incidentLocation = null;
        try {
            incidentLocation = incidentServiceClient.getIncidentLocation(request.getIncidentId());
            log.debug("Retrieved incident location: lat={}, lon={}", incidentLocation.getLatitude(), incidentLocation.getLongitude());
        } catch (Exception e) {
            log.warn("Failed to fetch incident location for incident ID {}. Error: {}", request.getIncidentId(), e.getMessage());
            throw new IllegalArgumentException("Could not retrieve incident location for ID: " + request.getIncidentId());
        }

        List<Long> departmentIds = new ArrayList<>();
        if (request.getDepartmentId() != null) {
            departmentIds.add(request.getDepartmentId());
        } else if (request.getMunicipalityId() != null) {
            try {
                MunicipalityBasicDTO municipality = municipalityServiceClient.getMunicipalityBasicInfo(request.getMunicipalityId());
                departmentIds = municipality.getDepartmentIds();
                log.debug("Retrieved {} departments for municipality ID {}", departmentIds.size(), request.getMunicipalityId());
            } catch (Exception e) {
                log.warn("Failed to fetch departments for municipality ID {}. Error: {}", request.getMunicipalityId(), e.getMessage());
                throw new IllegalArgumentException("Could not retrieve departments for municipality ID: " + request.getMunicipalityId());
            }
        }

        List<ResponseUnit> units;
        if (!departmentIds.isEmpty()) {
            units = departmentIds.stream()
                    .flatMap(deptId -> responseUnitRepository.findByDepartmentId(deptId).stream())
                    .filter(unit -> unit.getUnitType().equals(request.getUnitType()))
                    .filter(unit -> ResponseUnitStatus.AVAILABLE.equals(unit.getStatus()))
                    .collect(Collectors.toList());
        } else {
            units = responseUnitRepository.findAll().stream()
                    .filter(unit -> unit.getUnitType().equals(request.getUnitType()))
                    .filter(unit -> ResponseUnitStatus.AVAILABLE.equals(unit.getStatus()))
                    .collect(Collectors.toList());
        }

        log.debug("Found {} available units of type {} before distance filtering", units.size(), request.getUnitType());

        final double incidentLat = incidentLocation.getLatitude();
        final double incidentLon = incidentLocation.getLongitude();

        int limit = (request.getClosest() != null) ? request.getClosest() : 10;
        List<ResponseUnitSearchResponseDTO> results = units.stream()
                .map(unit -> {
                    ResponseUnitSearchResponseDTO dto = new ResponseUnitSearchResponseDTO();
                    dto.setUnitId(unit.getUnitId());
                    dto.setUnitName(unit.getUnitName());
                    dto.setDepartmentId(unit.getDepartmentId());
                    dto.setUnitType(unit.getUnitType());
                    dto.setStatus(unit.getStatus());

                    try {
                        DepartmentBasicDTO department = departmentServiceClient.getDepartmentBasicInfo(unit.getDepartmentId());
                        dto.setDepartmentName(department.getName());
                    } catch (Exception e) {
                        log.warn("Failed to fetch department name for department ID {}. Error: {}", unit.getDepartmentId(), e.getMessage());
                        dto.setDepartmentName("Unknown Department");
                    }

                    if (unit.getLatitude() != null && unit.getLongitude() != null) {
                        double distance = distanceCalculator.calculateDistance(
                                incidentLat, incidentLon,
                                unit.getLatitude(), unit.getLongitude()
                        );
                        dto.setDistanceKm(Math.round(distance * 100.0) / 100.0);
                    } else {
                        dto.setDistanceKm(null);
                    }

                    return dto;
                })
                .filter(dto -> dto.getDistanceKm() != null)
                .sorted(Comparator.comparing(ResponseUnitSearchResponseDTO::getDistanceKm))
                .limit(limit)
                .collect(Collectors.toList());

        log.info("Returning {} response units (closest {} with valid location)", results.size(), limit);
        return results;
    }
}
