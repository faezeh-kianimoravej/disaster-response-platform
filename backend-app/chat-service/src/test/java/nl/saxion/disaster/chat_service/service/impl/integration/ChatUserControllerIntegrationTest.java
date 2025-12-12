package nl.saxion.disaster.chat_service.service.impl.integration;


import com.fasterxml.jackson.databind.ObjectMapper;
import nl.saxion.disaster.chat_service.controller.ChatUserController;
import nl.saxion.disaster.chat_service.dto.ChatUserRequestDto;
import nl.saxion.disaster.chat_service.dto.ChatUserResponseDto;
import nl.saxion.disaster.chat_service.dto.LastReadUpdateRequestDto;
import nl.saxion.disaster.chat_service.service.ChatUserService;
import nl.saxion.disaster.chat_service.service.impl.config.TestSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChatUserController.class)
@Import(TestSecurityConfig.class)
@AutoConfigureMockMvc
class ChatUserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChatUserService chatUserService;

    @Autowired
    private ObjectMapper objectMapper;

    // ------------------------------------------------------
    // POST /api/chat/{groupId}/users
    // ------------------------------------------------------
    @Test
    void shouldAddUserToGroup() throws Exception {

        ChatUserRequestDto request = new ChatUserRequestDto(10L);

        ChatUserResponseDto response = ChatUserResponseDto.builder()
                .chatGroupId(1L)
                .userId(10L)
                .userFullName("John Doe")
                .userRole("RESPONDER")
                .lastReadMessageId(null)
                .build();

        when(chatUserService.addUserToGroup(1L, 10L)).thenReturn(response);

        mockMvc.perform(post("/api/chat/1/users")
                        .header("Authorization", "Bearer test-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userId").value(10L));
    }

    // ------------------------------------------------------
    // DELETE /api/chat/{groupId}/users/{userId}
    // ------------------------------------------------------
    @Test
    void shouldRemoveUserFromGroup() throws Exception {

        doNothing().when(chatUserService).removeUserFromGroup(1L, 10L);

        mockMvc.perform(delete("/api/chat/1/users/10")
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isNoContent());
    }

    // ------------------------------------------------------
    // PUT /api/chat/{groupId}/users/{userId}/read
    // ------------------------------------------------------
    @Test
    void shouldUpdateLastReadMessage() throws Exception {

        LastReadUpdateRequestDto request = new LastReadUpdateRequestDto(99L);

        doNothing().when(chatUserService)
                .updateLastReadMessage(1L, 10L, 99L);

        mockMvc.perform(put("/api/chat/1/users/10/read")
                        .header("Authorization", "Bearer test-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNoContent());
    }

    // ------------------------------------------------------
    // GET /api/chat/{groupId}/users
    // ------------------------------------------------------
    @Test
    void shouldGetUsersInGroup() throws Exception {

        List<ChatUserResponseDto> users = List.of(
                ChatUserResponseDto.builder()
                        .chatGroupId(1L)
                        .userId(10L)
                        .userFullName("John Doe")
                        .userRole("RESPONDER")
                        .lastReadMessageId(null)
                        .build(),
                ChatUserResponseDto.builder()
                        .chatGroupId(1L)
                        .userId(11L)
                        .userFullName("Jane Smith")
                        .userRole("COORDINATOR")
                        .lastReadMessageId(42L)
                        .build()
        );

        when(chatUserService.getUsersInGroup(1L)).thenReturn(users);

        mockMvc.perform(get("/api/chat/1/users")
                        .header("Authorization", "Bearer test-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].userId").value(10L));
    }
}
