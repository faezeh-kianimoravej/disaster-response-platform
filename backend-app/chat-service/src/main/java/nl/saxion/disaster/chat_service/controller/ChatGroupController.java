package nl.saxion.disaster.chat_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.chat_service.dto.ChatGroupListItemDto;
import nl.saxion.disaster.chat_service.dto.ChatGroupRequestDto;
import nl.saxion.disaster.chat_service.dto.ChatGroupResponseDto;
import nl.saxion.disaster.chat_service.service.ChatGroupService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(name = "Chat Groups", description = "Endpoints for managing chat groups")
@RestController
@RequestMapping("/api/chat/groups")
@RequiredArgsConstructor
public class ChatGroupController {

    private final ChatGroupService chatGroupService;

    @Operation(summary = "Create a new chat group for an incident")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Chat group created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    @PostMapping
    public ResponseEntity<ChatGroupResponseDto> createChatGroup(@Valid @RequestBody ChatGroupRequestDto request) {
        log.info("Creating chat group for incident: {}", request.getIncidentId());
        ChatGroupResponseDto response = chatGroupService.createChatGroupForIncident(
                request.getIncidentId(),
                request.getTitle()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Get chat group details by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Chat group found"),
            @ApiResponse(responseCode = "404", description = "Chat group not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ChatGroupResponseDto> getChatGroupById(@PathVariable Long id) {
        log.debug("Fetching chat group: {}", id);
        ChatGroupResponseDto response = chatGroupService.getChatGroupById(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get all chat groups for a user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Chat groups retrieved successfully")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ChatGroupListItemDto>> getChatGroupsByUser(@PathVariable Long userId) {
        log.info("Fetching chat groups for user: {}", userId);
        List<ChatGroupListItemDto> response = chatGroupService.getChatGroupsByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Close a chat group")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Chat group closed successfully"),
            @ApiResponse(responseCode = "404", description = "Chat group not found")
    })
    @PutMapping("/{id}/close")
    public ResponseEntity<Void> closeChatGroup(@PathVariable Long id) {
        log.info("Closing chat group: {}", id);
        chatGroupService.closeChatGroup(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get chat group details by incident ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Chat group found"),
            @ApiResponse(responseCode = "404", description = "Chat group not found")
    })
    @GetMapping("/{incidentId}")
    public ResponseEntity<ChatGroupResponseDto> getChatGroupByIncidentId(@PathVariable Long incidentId) {
        log.debug("Fetching chat group by incident id: {}", incidentId);
        ChatGroupResponseDto response = chatGroupService.getChatGroupByIncidentId(incidentId);
        return ResponseEntity.ok(response);
    }
}
