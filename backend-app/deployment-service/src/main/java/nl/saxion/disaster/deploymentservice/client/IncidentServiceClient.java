package nl.saxion.disaster.deploymentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "incident-service")
public interface IncidentServiceClient {
    
    @GetMapping("/api/incidents/{incidentId}/location")
    IncidentLocationDTO getIncidentLocation(@PathVariable("incidentId") Long incidentId);
}
