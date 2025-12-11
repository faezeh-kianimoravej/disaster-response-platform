package nl.saxion.disaster.chat_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.chat_service.service.ChatSseService;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Slf4j
@Tag(name = "Chat SSE", description = "Server-Sent Events endpoint for live chat updates")
@RestController
@RequestMapping("/api/chat/{groupId}/subscribe")
@RequiredArgsConstructor
public class ChatSseController {

    private final ChatSseService chatSseService;

    @Operation(summary = "Subscribe to live chat messages via SSE")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "SSE connection established"),
            @ApiResponse(responseCode = "404", description = "Chat group not found")
    })
    @GetMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(
            @PathVariable Long groupId,
            @AuthenticationPrincipal Jwt jwt) {
        String subject = jwt.getSubject();
        log.info("SSE subscription request for sub={} in group {}", subject, groupId);
        return chatSseService.addEmitter(groupId, subject);
    }
}
