package nl.saxion.disaster.deploymentservice.client;

import nl.saxion.disaster.deploymentservice.configuration.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(
        name = "chat-service",
        configuration = FeignClientConfig.class
)
public interface ChatServiceClient {

    @PostMapping("/api/chat/groups")
    ChatGroupResponseDTO createChatGroup(@RequestBody ChatGroupCreateDTO request);

    @PostMapping("/api/chat/{groupId}/users")
    void addUserToGroup(@PathVariable("groupId") Long groupId, @RequestBody ChatUserAddDTO request);
}
