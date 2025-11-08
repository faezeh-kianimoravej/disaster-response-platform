package nl.saxion.disaster.incident_service.client;

import nl.saxion.disaster.incident_service.dto.ResourceBasicDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "resource-service", path = "/api/resources")
public interface ResourceClient {

    @GetMapping("/{id}/basic")
    ResourceBasicDto getResourceBasicInfoById(@PathVariable("id") Long id);
}
