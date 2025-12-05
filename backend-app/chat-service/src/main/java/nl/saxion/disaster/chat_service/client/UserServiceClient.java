package nl.saxion.disaster.chat_service.client;

import nl.saxion.disaster.chat_service.dto.UserBasicDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Optional;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @GetMapping("/api/users/internal/{id}")
    Optional<UserBasicDTO> getUserById(@PathVariable("id") Long userId);
}
