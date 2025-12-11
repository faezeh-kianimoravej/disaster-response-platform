package nl.saxion.disaster.chat_service.service;

import nl.saxion.disaster.chat_service.dto.ChatMessageResponseDto;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

public interface ChatSseService {

    SseEmitter addEmitter(Long chatGroupId, String userId);

    void sendMessageToGroup(Long chatGroupId, ChatMessageResponseDto messageDto);

    void removeEmitter(Long chatGroupId, String userId);
}
