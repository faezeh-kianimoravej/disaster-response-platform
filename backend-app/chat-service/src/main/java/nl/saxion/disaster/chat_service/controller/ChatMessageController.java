package nl.saxion.disaster.chat_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.chat_service.dto.ChatMessageRequestDto;
import nl.saxion.disaster.chat_service.dto.ChatMessageResponseDto;
import nl.saxion.disaster.chat_service.service.ChatMessageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(name = "Chat Messages", description = "Endpoints for managing chat messages")
@RestController
@RequestMapping("/api/chat/{groupId}/messages")
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    @Operation(summary = "Send a new message to a chat group")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Message sent successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "404", description = "Chat group not found")
    })
    @PostMapping
    public ResponseEntity<ChatMessageResponseDto> sendMessage(
            @PathVariable Long groupId,
            @Valid @RequestBody ChatMessageRequestDto request) {
        log.info("Sending message to chat group: {}", groupId);
        ChatMessageResponseDto response = chatMessageService.sendMessage(
                groupId,
                request.getUserId(),
                request.getContent()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Get all messages in a chat group")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Messages retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Chat group not found")
    })
    @GetMapping
    public ResponseEntity<List<ChatMessageResponseDto>> getMessages(@PathVariable Long groupId) {
        log.debug("Fetching messages for chat group: {}", groupId);
        List<ChatMessageResponseDto> response = chatMessageService.getMessagesByGroupId(groupId);
        return ResponseEntity.ok(response);
    }
}
