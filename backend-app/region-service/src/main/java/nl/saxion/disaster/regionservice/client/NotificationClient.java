package nl.saxion.disaster.regionservice.client;

import nl.saxion.disaster.regionservice.dto.IncidentNotificationDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "notification-service")
public interface NotificationClient {
    @GetMapping("/api/notifications/after")
    List<IncidentNotificationDto> getNotificationsAfter(@RequestParam("afterId") Long afterId);
}
