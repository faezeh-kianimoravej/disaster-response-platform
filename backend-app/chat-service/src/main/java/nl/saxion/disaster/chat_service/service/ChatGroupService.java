package nl.saxion.disaster.chat_service.service;

import nl.saxion.disaster.chat_service.dto.ChatGroupListItemDto;
import nl.saxion.disaster.chat_service.dto.ChatGroupResponseDto;

import java.util.List;

public interface ChatGroupService {

    ChatGroupResponseDto createChatGroupForIncident(Long incidentId, String title);

    ChatGroupResponseDto getChatGroupById(Long groupId);

    ChatGroupResponseDto getChatGroupByIncidentId(Long incidentId);

    List<ChatGroupListItemDto> getChatGroupsByUserId(Long userId);

    void closeChatGroup(Long groupId);
}
