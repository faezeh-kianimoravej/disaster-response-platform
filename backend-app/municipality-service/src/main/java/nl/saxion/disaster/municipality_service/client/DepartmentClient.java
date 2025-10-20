package nl.saxion.disaster.municipality_service.client;

import nl.saxion.disaster.municipality_service.dto.DepartmentDto;
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
     * <p>
     * Example: GET /api/departments/by-municipality/{municipalityId}
     *
     * @param municipalityId the ID of the municipality
     * @return list of DepartmentDto objects
     */
    @GetMapping("/api/departments/by-municipality/{municipalityId}")
    List<DepartmentDto> getDepartmentsByMunicipality(@PathVariable("municipalityId") Long municipalityId);
}