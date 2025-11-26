package nl.saxion.disaster.deploymentservice.client;

import nl.saxion.disaster.deploymentservice.dto.ResourceAllocationBatchRequestDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "resource-service")
public interface ResourceServiceClient {
    
    @GetMapping("/api/resources/{resourceId}/location")
    ResourceLocationDTO getResourceLocationById(@PathVariable("resourceId") Long resourceId);


    @PostMapping("/api/resources/allocate")
    void allocateResources(@RequestBody ResourceAllocationBatchRequestDTO request);
}
