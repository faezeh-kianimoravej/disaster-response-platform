package nl.saxion.disaster.notification_service.client;


import nl.saxion.disaster.notification_service.dto.IncidentNotificationDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "region-service")
public interface RegionClient {

    @PostMapping("/api/regions/incidents/notify")
    void sendIncidentNotification(@RequestBody IncidentNotificationDto dto);
}
