package nl.saxion.disaster.chat_service.service;

import nl.saxion.disaster.chat_service.dto.ChatMessageResponseDto;

import java.util.List;

public interface ChatMessageService {

    ChatMessageResponseDto sendMessage(Long chatGroupId, Long userId, String content);

    List<ChatMessageResponseDto> getMessagesByGroupId(Long chatGroupId);

    List<ChatMessageResponseDto> getMessagesAfterMessageId(Long chatGroupId, Long messageId);
}
