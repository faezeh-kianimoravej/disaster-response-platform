package nl.saxion.disaster.municipality_service.client;

import nl.saxion.disaster.municipality_service.dto.DepartmentSummaryDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

/**
 * Feign client for communicating with the Department Service.
 * This client retrieves department information for a specific municipality.
 */
@FeignClient(name = "department-service")
public interface DepartmentClient {

    /**
     * Retrieves all departments belonging to a specific municipality.
     * Returns simplified DTOs without resources to limit nesting to one level.
     * <p>
     * Example: GET /api/departments/municipality/{municipalityId}
     *
     * @param municipalityId the ID of the municipality
     * @return list of DepartmentSummaryDto objects (without resources)
     */
    @GetMapping("/api/departments/municipality/{municipalityId}")
    List<DepartmentSummaryDto> getDepartmentsByMunicipality(@PathVariable("municipalityId") Long municipalityId);
}