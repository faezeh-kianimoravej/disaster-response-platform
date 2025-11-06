package nl.saxion.disaster.incident_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.incident_service.client.DepartmentClient;
import nl.saxion.disaster.incident_service.client.MunicipalityClient;
import nl.saxion.disaster.incident_service.client.ResourceClient;
import nl.saxion.disaster.incident_service.dto.IncidentResourceResponseDto;
import nl.saxion.disaster.incident_service.model.entity.IncidentResource;
import nl.saxion.disaster.incident_service.repository.contract.IncidentResourceRepository;
import nl.saxion.disaster.incident_service.service.contract.IncidentResourceService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for retrieving resources allocated to incidents.
 * <p>
 * This service fetches basic allocation records from the local database (incident_resources)
 * and enriches them with external data from the resource-, department-, and municipality-services
 * using Feign clients.
 * </p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IncidentResourceServiceImpl implements IncidentResourceService {

    private final IncidentResourceRepository repository;
    private final ResourceClient resourceClient;
    private final DepartmentClient departmentClient;
    private final MunicipalityClient municipalityClient;

    /**
     * Retrieves all resources assigned to a specific incident.
     * <p>
     * For each allocation record, the method fetches related data from:
     * <ul>
     *   <li><b>resource-service</b> → to get resource type and departmentId</li>
     *   <li><b>department-service</b> → to get department name and municipalityId</li>
     *   <li><b>municipality-service</b> → to get municipality name</li>
     * </ul>
     * The combined result is then returned to the frontend as a list of DTOs.
     * </p>
     *
     * @param incidentId the unique identifier of the incident
     * @return list of fully populated {@link IncidentResourceResponseDto} objects
     */
    @Override
    public List<IncidentResourceResponseDto> getResourcesByIncidentId(Long incidentId) {
        List<IncidentResource> entities = repository.findByIncidentId(incidentId);
        log.info("Found {} allocated resources for Incident ID {}", entities.size(), incidentId);

        return entities.stream()
                .map(resource -> {
                    // Fetch basic info of the resource
                    var resourceInfo = resourceClient.getResourceBasicInfoById(resource.getResourceId());

                    // Fetch department details using departmentId
                    var departmentInfo = departmentClient.getDepartmentBasicInfoById(resourceInfo.departmentId());

                    // Fetch municipality details using municipalityId
                    var municipalityInfo = municipalityClient.getMunicipalityBasicInfoById(departmentInfo.municipalityId());

                    // Combine everything into one response DTO
                    return new IncidentResourceResponseDto(
                            resource.getResourceId(),
                            resourceInfo.resourceType(),
                            departmentInfo.name(),
                            municipalityInfo.name(),
                            resource.getQuantity()
                    );
                })
                .collect(Collectors.toList());
    }
}
