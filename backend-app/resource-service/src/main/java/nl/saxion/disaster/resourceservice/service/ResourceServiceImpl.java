package nl.saxion.disaster.resourceservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.resourceservice.dto.*;
import nl.saxion.disaster.resourceservice.exception.ResourceException;
import nl.saxion.disaster.resourceservice.mapper.ResourceMapper;
import nl.saxion.disaster.resourceservice.model.entity.Resource;
import nl.saxion.disaster.resourceservice.model.enums.ResourceType;
import nl.saxion.disaster.resourceservice.repository.contract.ResourceRepository;
import nl.saxion.disaster.resourceservice.service.contract.ResourceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceMapper resourceMapper;

    @Override
    public Optional<ResourceDto> getResourceById(Long id) {
        return resourceRepository.findById(id)
                .map(resourceMapper::toDto);
    }

    @Override
    public List<ResourceDto> getAvailableResources() {
        return resourceRepository.findAllAvailableResources()
                .stream()
                .map(resourceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceDto> getAvailableResourcesByDepartment(Long departmentId) {
        return getAvailableResources().stream()
            .filter(r -> r.departmentId() != null && r.departmentId().equals(departmentId))
            .toList();
    }

    @Override
    public List<ResourceDto> getResourcesByType(ResourceType type) {
        return resourceRepository.findByType(type)
                .stream()
                .map(resourceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceDto> getResourcesByDepartment(Long departmentId) {
        return resourceRepository.findByDepartment(departmentId)
                .stream()
                .map(resourceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceDto createResource(ResourceDto resourceDto) {
        Resource entity = resourceMapper.toEntity(resourceDto);
        Resource saved = resourceRepository.save(entity);
        return resourceMapper.toDto(saved);
    }

    @Override
    public ResourceDto editResource(Long id, ResourceDto resourceDetails) {
        Resource entity = resourceMapper.toEntity(resourceDetails);
        Resource updated = resourceRepository.edit(id, entity);
        return resourceMapper.toDto(updated);
    }

    @Override
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }


    @Override
    public Optional<ResourceBasicDto> getResourceBasicInfoById(Long id) {
        return resourceRepository.findById(id)
            .map(resource -> new ResourceBasicDto(
                resource.getResourceId(),
                resource.getName(),
                resource.getResourceType(),
                resource.getDepartmentId()
            ));
        }

    @Override
    public Optional<ResourceLocationDto> getResourceLocationById(Long id) {
        return resourceRepository.findById(id)
            .map(resource -> new ResourceLocationDto(
                resource.getResourceId(),
                resource.getLatitude() != null ? resource.getLatitude() : 0.0,
                resource.getLongitude() != null ? resource.getLongitude() : 0.0
            ));
    }

    @Transactional
    public void allocateResources(ResourceAllocationBatchRequestDTO request) {

        Long deploymentId = request.getDeploymentId();
        Long unitId = request.getResponseUnitId();

        log.info("Allocating {} resources for deploymentId={} (unitId={})",
                request.getAllocations().size(), deploymentId, unitId);

        for (ResourceAllocationItemDTO item : request.getAllocations()) {

            int updated = resourceRepository.allocateResource(
                    item.getResourceId(),
                    item.getQuantity(),
                    deploymentId
            );

            if (updated == 0) {
                throw new ResourceException(
                        "Insufficient quantity or resource not found: resourceId=" + item.getResourceId()
                );
            }

            log.info("Allocated {} units of resource {} for deployment {}",
                    item.getQuantity(), item.getResourceId(), deploymentId);
        }
    }
}

