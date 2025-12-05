package nl.saxion.disaster.chat_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.chat_service.dto.ChatUserRequestDto;
import nl.saxion.disaster.chat_service.dto.ChatUserResponseDto;
import nl.saxion.disaster.chat_service.dto.LastReadUpdateRequestDto;
import nl.saxion.disaster.chat_service.service.ChatUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(name = "Chat Users", description = "Endpoints for managing users in chat groups")
@RestController
@RequestMapping("/api/chat/{groupId}/users")
@RequiredArgsConstructor
public class ChatUserController {

    private final ChatUserService chatUserService;

    @Operation(summary = "Add a user to a chat group")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User added successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "404", description = "Chat group or user not found")
    })
    @PostMapping
    public ResponseEntity<ChatUserResponseDto> addUserToGroup(
            @PathVariable Long groupId,
            @Valid @RequestBody ChatUserRequestDto request) {
        log.info("Adding user {} to chat group {}", request.getUserId(), groupId);
        ChatUserResponseDto response = chatUserService.addUserToGroup(groupId, request.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Remove a user from a chat group")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "User removed successfully"),
            @ApiResponse(responseCode = "404", description = "Chat group or user not found")
    })
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeUserFromGroup(
            @PathVariable Long groupId,
            @PathVariable Long userId) {
        log.info("Removing user {} from chat group {}", userId, groupId);
        chatUserService.removeUserFromGroup(groupId, userId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update last read message for a user")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Last read message updated successfully"),
            @ApiResponse(responseCode = "404", description = "Chat group or user not found")
    })
    @PutMapping("/{userId}/read")
    public ResponseEntity<Void> updateLastReadMessage(
            @PathVariable Long groupId,
            @PathVariable Long userId,
            @Valid @RequestBody LastReadUpdateRequestDto request) {
        log.debug("Updating last read message for user {} in group {}", userId, groupId);
        chatUserService.updateLastReadMessage(groupId, userId, request.getMessageId());
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get all users in a chat group")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Users retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Chat group not found")
    })
    @GetMapping
    public ResponseEntity<List<ChatUserResponseDto>> getUsersInGroup(@PathVariable Long groupId) {
        log.debug("Fetching users in chat group {}", groupId);
        List<ChatUserResponseDto> response = chatUserService.getUsersInGroup(groupId);
        return ResponseEntity.ok(response);
    }
}
