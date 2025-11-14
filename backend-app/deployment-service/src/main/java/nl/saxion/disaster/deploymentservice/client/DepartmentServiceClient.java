package nl.saxion.disaster.deploymentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "department-service")
public interface DepartmentServiceClient {
    
    @GetMapping("/api/departments/{departmentId}/basic")
    DepartmentBasicDTO getDepartmentBasicInfo(@PathVariable("departmentId") Long departmentId);
}
