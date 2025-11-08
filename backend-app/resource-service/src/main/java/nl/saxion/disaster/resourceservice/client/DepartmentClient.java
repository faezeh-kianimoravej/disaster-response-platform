package nl.saxion.disaster.resourceservice.client;

import nl.saxion.disaster.resourceservice.dto.DepartmentBasicDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "department-service", path = "/api/departments")
public interface DepartmentClient {

    /**
     * Returns basic info of a single department by its ID.
     */
    @GetMapping("/{id}/basic")
    DepartmentBasicDto getDepartmentBasicInfoById(@PathVariable("id") Long id);

    /**
     * Returns all departments (basic info) belonging to a specific municipality.
     * <p>
     * Used by resource-service when filtering available resources by municipality.
     * </p>
     *
     * @param municipalityId the ID of the municipality
     * @return list of basic department DTOs (id, name, municipalityId)
     */
    @GetMapping("/by-municipality/{municipalityId}/basic")
    List<DepartmentBasicDto> getDepartmentsByMunicipalityId(@PathVariable("municipalityId") Long municipalityId);
}
