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

import java.util.*;
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
    // ----------------------------------------------------------------------------------------
// Advanced search: Get available resources for an incident (sorted by distance)
// ----------------------------------------------------------------------------------------
    @Override
    public List<ResourceSearchResponseDto> getNearestResourcesForIncident(ResourceSearchRequestDto resourceSearchRequestDto) {

        // Normalize request parameters
        String resourceType = normalizeResourceType(resourceSearchRequestDto.resourceType());
        Long departmentId = resourceSearchRequestDto.departmentId();
        Long municipalityId = resourceSearchRequestDto.municipalityId();

        // Retrieve the incident's location from incident-service
        IncidentLocationDto incidentLocation = incidentClient.getIncidentLocation(resourceSearchRequestDto.incidentId());

        // Determine related department IDs if only a municipality filter is provided
        List<Long> departmentIds = getDepartmentIds(municipalityId, departmentId);

        // ❗Safety guard: if municipality filter is set but no departments found, return empty quickly
        //    (Prevents IN ([null,...]) and avoids unnecessary DB/external calls)
        if (municipalityId != null && departmentId == null &&
                (departmentIds == null || departmentIds.isEmpty())) {
            return Collections.emptyList();
        }

        // Fetch available resources from the database
        List<Resource> availableResources = getAvailableResources(resourceType, departmentId, departmentIds);

        // Collect resourceIds for active allocation query
        List<Long> resourceIds = availableResources.stream()
                .map(Resource::getResourceId)
                .collect(Collectors.toList());

        // Fetch active allocations from incident-service (skip call if there is nothing to check)
        Map<Long, Integer> activeAllocations =
                resourceIds.isEmpty()
                        ? Collections.emptyMap()
                        : incidentClient.getActiveAllocationsForResources(resourceIds);

        // Map Resource entities into frontend-friendly DTOs, and calculate available
        List<ResourceSearchResponseDto> toSort = calculateAvailableResources(availableResources, activeAllocations, incidentLocation);

        // Sort resources by ascending distance and limit to top 10 results
        // If `distance` in DTO is double -> this line is fine.
        // If `distance` is a String like "12.3 km", replace the comparator with:
        // .sorted(Comparator.comparingDouble(dto -> Double.parseDouble(dto.distance().replace(" km","").trim())))
        return toSort.stream()
                .sorted(Comparator.comparing(ResourceSearchResponseDto::distance))
                .limit(10)
                .collect(Collectors.toList());
    }

    // Normalize resourceType if "All" is provided
    private String normalizeResourceType(String resourceType) {
        if (resourceType != null && resourceType.equalsIgnoreCase("All")) {
            return null;
        }
        return resourceType;
    }

    // Get departmentIds if only municipalityId is provided
    private List<Long> getDepartmentIds(Long municipalityId, Long departmentId) {
        if (municipalityId != null && departmentId == null) {
            List<Long> departmentIds = departmentClient.getDepartmentsByMunicipalityId(municipalityId)
                    .stream()
                    .map(DepartmentBasicDto::id)
                    .filter(Objects::nonNull)
                    .distinct()
                    .toList();

            return departmentIds;
        }
        return null;
    }


    // Fetch available resources from the repository
    private List<Resource> getAvailableResources(String resourceType, Long departmentId, List<Long> departmentIds) {
        return resourceRepository.findAvailableResourcesByTypeAndDepartment(resourceType, departmentId, departmentIds);
    }

    // Calculate available resources and create response DTOs
    private List<ResourceSearchResponseDto> calculateAvailableResources(List<Resource> availableResources, Map<Long, Integer> activeAllocations, IncidentLocationDto incidentLocation) {
        List<ResourceSearchResponseDto> toSort = new ArrayList<>();
        for (Resource availableResource : availableResources) {
            int allocated = activeAllocations.getOrDefault(availableResource.getResourceId(), 0);
            int available = Math.max(availableResource.getQuantity() - allocated, 0); // Ensure non-negative available

            if (available > 0) {  // Only include resources with available quantity > 0
                DepartmentBasicDto department = departmentClient.getDepartmentBasicInfoById(availableResource.getDepartmentId());
                MunicipalityBasicDto municipality = municipalityClient.getMunicipalityBasicInfoById(department.municipalityId());

                // Calculate distance from the incident location
                double distanceKm = distanceCalculator.calculateDistanceKm(
                        incidentLocation.latitude(), incidentLocation.longitude(),
                        availableResource.getLatitude(), availableResource.getLongitude()
                );

                toSort.add(mapToResourceSearchResponse(availableResource, department, municipality, available, distanceKm));
            }
        }
        return toSort;
    }

    // Map resource data to ResourceSearchResponseDto
    private ResourceSearchResponseDto mapToResourceSearchResponse(Resource availableResource, DepartmentBasicDto department, MunicipalityBasicDto municipality, int available, double distanceKm) {
        return new ResourceSearchResponseDto(
                availableResource.getResourceId(),
                availableResource.getResourceType().name(),
                department.name(),
                municipality.name(),
                available,
                String.format("%.1f km", distanceKm)
        );
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
}

