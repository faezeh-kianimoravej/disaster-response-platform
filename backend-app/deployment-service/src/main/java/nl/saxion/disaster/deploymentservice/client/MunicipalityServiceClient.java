package nl.saxion.disaster.deploymentservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "municipality-service")
public interface MunicipalityServiceClient {
    
    @GetMapping("/api/municipalities/{municipalityId}/basic")
    MunicipalityBasicDTO getMunicipalityBasicInfo(@PathVariable("municipalityId") Long municipalityId);
}
