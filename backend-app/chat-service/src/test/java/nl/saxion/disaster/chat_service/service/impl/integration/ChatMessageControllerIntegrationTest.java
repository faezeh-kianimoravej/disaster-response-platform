package nl.saxion.disaster.chat_service.service.impl.integration;


import com.fasterxml.jackson.databind.ObjectMapper;
import nl.saxion.disaster.chat_service.controller.ChatMessageController;
import nl.saxion.disaster.chat_service.dto.ChatMessageRequestDto;
import nl.saxion.disaster.chat_service.dto.ChatMessageResponseDto;
import nl.saxion.disaster.chat_service.service.ChatMessageService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChatMessageController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("ChatMessageController Integration Tests")
class ChatMessageControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatMessageService chatMessageService;

    // ------------------------------------------------------
    // POST /api/chat/{groupId}/messages
    // ------------------------------------------------------
    @Test
    @DisplayName("POST /api/chat/{groupId}/messages - should send message")
    void shouldSendMessage() throws Exception {

        ChatMessageRequestDto request =
                new ChatMessageRequestDto(10L, "Hello team");

        ChatMessageResponseDto response =
                ChatMessageResponseDto.builder()
                        .chatMessageId(1L)
                        .chatGroupId(5L)
                        .userId(10L)
                        .userFullName("John Doe")
                        .userRole("Coordinator")
                        .content("Hello team")
                        .timestamp(Instant.now())
                        .build();

        when(chatMessageService.sendMessage(5L, 10L, "Hello team"))
                .thenReturn(response);

        mockMvc.perform(post("/api/chat/5/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.chatMessageId").value(1L))
                .andExpect(jsonPath("$.chatGroupId").value(5L))
                .andExpect(jsonPath("$.userId").value(10L))
                .andExpect(jsonPath("$.content").value("Hello team"));
    }

    // ------------------------------------------------------
    // GET /api/chat/{groupId}/messages
    // ------------------------------------------------------
    @Test
    @DisplayName("GET /api/chat/{groupId}/messages - should return messages")
    void shouldGetMessages() throws Exception {

        ChatMessageResponseDto message =
                ChatMessageResponseDto.builder()
                        .chatMessageId(1L)
                        .chatGroupId(5L)
                        .userId(10L)
                        .userFullName("John Doe")
                        .userRole("Coordinator")
                        .content("Hello team")
                        .timestamp(Instant.now())
                        .build();

        when(chatMessageService.getMessagesByGroupId(5L))
                .thenReturn(List.of(message));

        mockMvc.perform(get("/api/chat/5/messages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].chatMessageId").value(1L))
                .andExpect(jsonPath("$[0].content").value("Hello team"));
    }
}
