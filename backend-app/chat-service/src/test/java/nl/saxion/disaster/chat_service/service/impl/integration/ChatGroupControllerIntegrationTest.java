package nl.saxion.disaster.chat_service.service.impl.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import nl.saxion.disaster.chat_service.controller.ChatGroupController;
import nl.saxion.disaster.chat_service.dto.ChatGroupListItemDto;
import nl.saxion.disaster.chat_service.dto.ChatGroupRequestDto;
import nl.saxion.disaster.chat_service.dto.ChatGroupResponseDto;
import nl.saxion.disaster.chat_service.service.ChatGroupService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChatGroupController.class)
@AutoConfigureMockMvc(addFilters = false)
@DisplayName("ChatGroupController Integration Tests")
class ChatGroupControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatGroupService chatGroupService;

    // ------------------------------------------------------
    // POST /api/chat/groups
    // ------------------------------------------------------
    @Test
    @DisplayName("POST /api/chat/groups - should create chat group")
    void shouldCreateChatGroup() throws Exception {

        ChatGroupRequestDto request =
                new ChatGroupRequestDto(100L, "Incident Chat");

        ChatGroupResponseDto response =
                ChatGroupResponseDto.builder()
                        .chatGroupId(1L)
                        .incidentId(100L)
                        .title("Incident Chat")
                        .createdAt(Instant.now())
                        .isClosed(false)
                        .build();

        when(chatGroupService.createChatGroupForIncident(100L, "Incident Chat"))
                .thenReturn(response);

        mockMvc.perform(post("/api/chat/groups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.chatGroupId").value(1L))
                .andExpect(jsonPath("$.incidentId").value(100L))
                .andExpect(jsonPath("$.title").value("Incident Chat"))
                .andExpect(jsonPath("$.isClosed").value(false));
    }

    // ------------------------------------------------------
    // GET /api/chat/groups/{id}
    // ------------------------------------------------------
    @Test
    @DisplayName("GET /api/chat/groups/{id} - should return chat group")
    void shouldGetChatGroupById() throws Exception {

        ChatGroupResponseDto response =
                ChatGroupResponseDto.builder()
                        .chatGroupId(1L)
                        .incidentId(100L)
                        .title("Incident Chat")
                        .createdAt(Instant.now())
                        .isClosed(false)
                        .build();

        when(chatGroupService.getChatGroupById(1L))
                .thenReturn(response);

        mockMvc.perform(get("/api/chat/groups/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chatGroupId").value(1L))
                .andExpect(jsonPath("$.incidentId").value(100L))
                .andExpect(jsonPath("$.title").value("Incident Chat"));
    }

    // ------------------------------------------------------
    // GET /api/chat/groups/user/{userId}
    // ------------------------------------------------------
    @Test
    @DisplayName("GET /api/chat/groups/user/{userId} - should return list")
    void shouldGetChatGroupsByUser() throws Exception {

        ChatGroupListItemDto item =
                ChatGroupListItemDto.builder()
                        .chatGroupId(1L)
                        .incidentId(100L)
                        .title("Incident Chat")
                        .createdAt(Instant.now())
                        .isClosed(false)
                        .numberOfUnreadMessages(2L)
                        .build();

        when(chatGroupService.getChatGroupsByUserId(10L))
                .thenReturn(List.of(item));

        mockMvc.perform(get("/api/chat/groups/user/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].chatGroupId").value(1L))
                .andExpect(jsonPath("$[0].title").value("Incident Chat"))
                .andExpect(jsonPath("$[0].numberOfUnreadMessages").value(2));
    }

    // ------------------------------------------------------
    // PUT /api/chat/groups/{id}/close
    // ------------------------------------------------------
    @Test
    @DisplayName("PUT /api/chat/groups/{id}/close - should close chat group")
    void shouldCloseChatGroup() throws Exception {

        mockMvc.perform(put("/api/chat/groups/1/close"))
                .andExpect(status().isNoContent());
    }
}
