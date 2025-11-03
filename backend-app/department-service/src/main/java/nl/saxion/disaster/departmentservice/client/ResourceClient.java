package nl.saxion.disaster.departmentservice.client;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

import nl.saxion.disaster.departmentservice.dto.ResourceSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;

/**
 * Feign client for communicating with the Resource Service.
 * This client retrieves resource information for a specific municipality.
 */
@FeignClient(name = "resource-service")
public interface ResourceClient {

    /**
     * Retrieves all resources belonging to a specific department.
     * Returns simplified DTOs without resources to limit nesting to one level.
     * <p>
     * Example: GET /api/resources/department/{resourceId}
     *
     * @param departmentId the ID of the department
     * @return list of Resource objects (without resources)
     */
    @GetMapping("/api/resources/department/{departmentId}")
    List<ResourceSummaryDto> getResourcesByDepartment(@PathVariable("departmentId") Long departmentId);
}
