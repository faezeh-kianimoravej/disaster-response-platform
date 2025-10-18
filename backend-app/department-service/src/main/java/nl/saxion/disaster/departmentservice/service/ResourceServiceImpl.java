package nl.saxion.disaster.departmentservice.service;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.departmentservice.dto.ResourceDto;
import nl.saxion.disaster.departmentservice.mapper.ResourceMapper;
import nl.saxion.disaster.departmentservice.model.entity.Resource;
import nl.saxion.disaster.departmentservice.model.enums.ResourceType;
import nl.saxion.disaster.departmentservice.repository.contract.ResourceRepository;
import nl.saxion.disaster.departmentservice.service.contract.ResourceService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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
        return resourceRepository.findAvailable()
                .stream()
                .map(resourceMapper::toDto)
                .collect(Collectors.toList());
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
}
