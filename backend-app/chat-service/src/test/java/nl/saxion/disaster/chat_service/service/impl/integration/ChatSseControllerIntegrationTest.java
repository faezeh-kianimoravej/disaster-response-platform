package nl.saxion.disaster.chat_service.service.impl.integration;


import nl.saxion.disaster.chat_service.controller.ChatSseController;
import nl.saxion.disaster.chat_service.service.ChatSseService;
import nl.saxion.disaster.chat_service.service.impl.config.TestSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChatSseController.class)
@Import(TestSecurityConfig.class)
@AutoConfigureMockMvc
class ChatSseControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChatSseService chatSseService;

    @Test
    void shouldSubscribeToChatSse() throws Exception {

        when(chatSseService.addEmitter(1L, "user-123"))
                .thenReturn(new SseEmitter());

        mockMvc.perform(get("/api/chat/1/subscribe")
                        .header("Authorization", "Bearer test-token")
                        .accept(MediaType.TEXT_EVENT_STREAM))
                .andExpect(status().isOk())
                .andExpect(request().asyncStarted());
    }
}
