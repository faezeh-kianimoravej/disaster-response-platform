package nl.saxion.disaster.municipality_service.client;

import nl.saxion.disaster.municipality_service.model.dto.DepartmentDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(
        name = "department-service",
        url = "http://department-service:8081/api/department"
)
public interface DepartmentClient {

    @GetMapping("/by-municipality/{municipalityId}")
    List<DepartmentDto> getDepartmentsByMunicipality(@PathVariable Long municipalityId);
}