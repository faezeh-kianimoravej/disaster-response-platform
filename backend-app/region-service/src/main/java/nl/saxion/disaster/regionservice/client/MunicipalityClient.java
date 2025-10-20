package nl.saxion.disaster.regionservice.client;

import nl.saxion.disaster.regionservice.dto.MunicipalityDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

/**
 * Feign client to communicate with municipality-service via Eureka.
 */
@FeignClient(name = "municipality-service")
public interface MunicipalityClient {

    @GetMapping("/api/municipalities/region/{regionId}")
    List<MunicipalityDto> getMunicipalitiesByRegion(@PathVariable("regionId") Long regionId);
}
