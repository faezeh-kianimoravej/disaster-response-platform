package nl.saxion.disaster.incident_service.client;

import nl.saxion.disaster.incident_service.dto.DepartmentBasicDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "department-service", path = "/api/departments")
public interface DepartmentClient {

    @GetMapping("/{id}/basic")
    DepartmentBasicDto getDepartmentBasicInfoById(@PathVariable("id") Long id);
}
