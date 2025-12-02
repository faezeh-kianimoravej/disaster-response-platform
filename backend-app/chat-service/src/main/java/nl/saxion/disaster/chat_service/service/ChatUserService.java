package nl.saxion.disaster.chat_service.service;

import nl.saxion.disaster.chat_service.dto.ChatUserResponseDto;

import java.util.List;

public interface ChatUserService {

    ChatUserResponseDto addUserToGroup(Long chatGroupId, Long userId);

    void removeUserFromGroup(Long chatGroupId, Long userId);

    void updateLastReadMessage(Long chatGroupId, Long userId, Long messageId);

    List<ChatUserResponseDto> getUsersInGroup(Long chatGroupId);

    Long getUnreadMessageCount(Long chatGroupId, Long userId);
}
