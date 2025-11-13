package nl.saxion.disaster.deploymentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "resource-service")
public interface ResourceServiceClient {
    
    @GetMapping("/api/resources/{resourceId}/location")
    ResourceLocationDTO getResourceLocationById(@PathVariable("resourceId") Long resourceId);
}
