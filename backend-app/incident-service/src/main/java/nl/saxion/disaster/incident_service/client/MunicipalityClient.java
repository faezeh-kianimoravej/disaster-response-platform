package nl.saxion.disaster.incident_service.client;

import nl.saxion.disaster.incident_service.dto.MunicipalityBasicDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "municipality-service", path = "/api/municipalities")
public interface MunicipalityClient {

    @GetMapping("/{id}/basic")
    MunicipalityBasicDto getMunicipalityBasicInfoById(@PathVariable("id") Long id);
}
