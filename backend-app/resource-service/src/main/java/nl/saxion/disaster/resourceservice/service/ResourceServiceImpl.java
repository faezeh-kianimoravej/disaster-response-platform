package nl.saxion.disaster.resourceservice.service;


import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.resourceservice.client.DepartmentClient;
import nl.saxion.disaster.resourceservice.client.IncidentClient;
import nl.saxion.disaster.resourceservice.client.MunicipalityClient;
import nl.saxion.disaster.resourceservice.dto.*;
import nl.saxion.disaster.resourceservice.mapper.ResourceMapper;
import nl.saxion.disaster.resourceservice.model.entity.Resource;
import nl.saxion.disaster.resourceservice.model.enums.ResourceType;
import nl.saxion.disaster.resourceservice.repository.contract.ResourceRepository;
import nl.saxion.disaster.resourceservice.service.contract.ResourceService;
import nl.saxion.disaster.resourceservice.util.DistanceCalculator;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceMapper resourceMapper;
    private final IncidentClient incidentClient;
    private final DepartmentClient departmentClient;
    private final MunicipalityClient municipalityClient;
    private final DistanceCalculator distanceCalculator;

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

    // ----------------------------------------------------------------------------------------
    // Advanced search: Get available resources for an incident (sorted by distance)
    // ----------------------------------------------------------------------------------------
    @Override
    public List<ResourceSearchResponseDto> getNearestResourcesForIncident(ResourceSearchRequestDto resourceSearchRequestDto) {

        // Normalize request parameters
        // Convert "All" dropdown values to null for easier filtering in repository
        String resourceType = resourceSearchRequestDto.resourceType();
        if (resourceType != null && resourceType.equalsIgnoreCase("All")) {
            resourceType = null;
        }
        Long departmentId = resourceSearchRequestDto.departmentId();
        Long municipalityId = resourceSearchRequestDto.municipalityId();

        // Retrieve the incident's location from incident-service
        IncidentLocationDto incidentLocation = incidentClient.getIncidentLocation(resourceSearchRequestDto.incidentId());

        // Determine related department IDs if only a municipality filter is provided
        List<Long> departmentIds = null;
        if (municipalityId != null && departmentId == null) {
            var departments = departmentClient.getDepartmentsByMunicipalityId(municipalityId);
            departmentIds = departments.stream()
                    .map(DepartmentBasicDto::id)
                    .toList();
        }

        // Fetch available resources from the database
        // Filters dynamically by resourceType, departmentId, or municipality's departmentIds
        List<Resource> availableResources = resourceRepository.findAvailableResourcesByTypeAndDepartment(
                resourceType,
                departmentId,
                departmentIds
        );

        // Map Resource entities into frontend-friendly DTOs
        // Includes department & municipality names and calculated distance
        // Sort by ascending distance
        // Limit to top 10 nearest results
        List<ResourceSearchResponseDto> toSort = new ArrayList<>();
        for (Resource availableResource : availableResources) {
            DepartmentBasicDto department = departmentClient.getDepartmentBasicInfoById(availableResource.getDepartmentId());
            MunicipalityBasicDto municipality = municipalityClient.getMunicipalityBasicInfoById(department.municipalityId());

            double distanceKm = distanceCalculator.calculateDistanceKm(
                    incidentLocation.latitude(), incidentLocation.longitude(),
                    availableResource.getLatitude(), availableResource.getLongitude()
            );

            ResourceSearchResponseDto apply = new ResourceSearchResponseDto(
                    availableResource.getResourceId(),
                    availableResource.getResourceType().name(),
                    department.name(),
                    municipality.name(),
                    availableResource.getAvailable(),
                    String.format("%.1f km", distanceKm)
            );
            toSort.add(apply);
        }
        toSort.sort(Comparator.comparing(ResourceSearchResponseDto::distance));
        List<ResourceSearchResponseDto> list = new ArrayList<>();
        long limit = 10;
        for (ResourceSearchResponseDto apply : toSort) {
            if (limit-- == 0) break;
            list.add(apply);
        }
        return list;
    }

    /**
     * Finalizes the resource allocation process for a specific incident.
     * <p>
     * This method performs the following steps:
     * <ul>
     *   <li>Validates that the target incident exists by contacting the <b>incident-service</b>.</li>
     *   <li>For each resource in the request:
     *       <ul>
     *         <li>Verifies that the resource exists and has sufficient available quantity.</li>
     *         <li>Updates the resource’s available count in the database.</li>
     *       </ul>
     *   </li>
     *   <li>Notifies the <b>incident-service</b> to register the allocated resources for the incident.</li>
     * </ul>
     * </p>
     *
     * @param request the allocation request containing the incident ID and list of resource allocations
     * @throws IllegalArgumentException if the incident or any resource is not found,
     *                                  or if insufficient resources are available
     * @throws IllegalStateException    if communication with the incident-service fails
     */
    @Override
    public void allocateResourcesToIncident(ResourceAllocationRequestDto request) {

        // Validate that the incident exists (using Feign client)
        validateIncidentExists(request.incidentId());

        // For each allocated resource, verify availability and update
        for (var allocation : request.allocations()) {
            Resource resource = resourceRepository.findById(allocation.resourceId())
                    .orElseThrow(() ->
                            new IllegalArgumentException("Resource not found with ID: " + allocation.resourceId()));

            if (resource.getAvailable() < allocation.quantity()) {
                throw new IllegalArgumentException(
                        "Not enough available units for resource: " + resource.getName());
            }

            updateResourceAvailability(resource, allocation.quantity());
        }

        // Notify incident-service to register allocation
        incidentClient.assignResourcesToIncident(request.incidentId(), request.allocations());
    }

    /**
     * Validates that an incident with the given ID exists in the incident-service.
     * Throws an exception if the incident cannot be found or the service is unavailable.
     *
     * @param incidentId the ID of the incident to validate
     */
    private void validateIncidentExists(Long incidentId) {
        try {
            var incident = incidentClient.getIncidentBasicInfoById(incidentId);
            if (incident == null) {
                throw new IllegalArgumentException("Incident not found with ID: " + incidentId);
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to validate incident existence (incident-service might be unavailable)", ex);
        }
    }


    /**
     * Decreases the available count for a resource and persists the change.
     *
     * @param resource          the resource entity to update
     * @param quantityAllocated how many units were allocated
     */
    private void updateResourceAvailability(Resource resource, int quantityAllocated) {
        int updatedAvailable = resource.getAvailable() - quantityAllocated;
        resource.setAvailable(updatedAvailable);

        // Delegate persistence to the repository (which handles its own transaction)
        resourceRepository.edit(resource.getResourceId(), resource);
    }
}

