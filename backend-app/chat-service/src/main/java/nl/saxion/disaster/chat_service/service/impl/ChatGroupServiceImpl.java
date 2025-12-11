package nl.saxion.disaster.chat_service.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.chat_service.dto.ChatGroupListItemDto;
import nl.saxion.disaster.chat_service.dto.ChatGroupResponseDto;
import nl.saxion.disaster.chat_service.dto.ChatMessageResponseDto;
import nl.saxion.disaster.chat_service.exception.ChatGroupNotFoundException;
import nl.saxion.disaster.chat_service.model.ChatGroup;
import nl.saxion.disaster.chat_service.model.ChatMessage;
import nl.saxion.disaster.chat_service.model.ChatUser;
import nl.saxion.disaster.chat_service.repository.ChatGroupRepository;
import nl.saxion.disaster.chat_service.repository.ChatMessageRepository;
import nl.saxion.disaster.chat_service.repository.ChatUserRepository;
import nl.saxion.disaster.chat_service.service.ChatGroupService;
import nl.saxion.disaster.chat_service.service.ChatUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatGroupServiceImpl implements ChatGroupService {

    private final ChatGroupRepository chatGroupRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatUserRepository chatUserRepository;

    @Override
    @Transactional
    public ChatGroupResponseDto createChatGroupForIncident(Long incidentId, String title) {
        log.info("Creating chat group for incident: {}", incidentId);

        // Check if chat group already exists for this incident
        return chatGroupRepository.findByIncidentId(incidentId)
                .map(existingGroup -> {
                    log.info("Chat group already exists for incident {}: {}", incidentId, existingGroup.getChatGroupId());
                    return mapToResponseDto(existingGroup);
                })
                .orElseGet(() -> {
                    ChatGroup chatGroup = ChatGroup.builder()
                            .incidentId(incidentId)
                            .title(title)
                            .isClosed(false)
                            .build();

                    ChatGroup savedGroup = chatGroupRepository.save(chatGroup);
                    log.info("Chat group created with id: {}", savedGroup.getChatGroupId());
                    return mapToResponseDto(savedGroup);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public ChatGroupResponseDto getChatGroupById(Long groupId) {
        log.debug("Fetching chat group with id: {}", groupId);

        ChatGroup chatGroup = chatGroupRepository.findById(groupId)
                .orElseThrow(() -> new ChatGroupNotFoundException(groupId));

        return mapToResponseDto(chatGroup);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatGroupListItemDto> getChatGroupsByUserId(Long userId) {
        log.debug("Fetching chat groups for user: {}", userId);

        List<ChatGroup> chatGroups = chatGroupRepository.findAllByUserId(userId);
        List<ChatGroupListItemDto> result = new ArrayList<>();

        for (ChatGroup group : chatGroups) {
            // Get last message
            List<ChatMessage> messages = chatMessageRepository.findByChatGroupIdOrderByTimestampAsc(group.getChatGroupId());
            ChatMessageResponseDto lastMessage = null;
            if (!messages.isEmpty()) {
                ChatMessage last = messages.get(messages.size() - 1);
                ChatUser chatUser = chatUserRepository.findByChatGroupIdAndUserId(group.getChatGroupId(), last.getUserId())
                        .orElse(null);
                
                lastMessage = ChatMessageResponseDto.builder()
                        .chatMessageId(last.getChatMessageId())
                        .chatGroupId(last.getChatGroupId())
                        .userId(last.getUserId())
                        .userFullName(chatUser != null ? chatUser.getUserFullName() : "Unknown")
                        .userRole(chatUser != null ? chatUser.getUserRole() : "Unknown")
                        .content(last.getContent())
                        .timestamp(last.getTimestamp())
                        .build();
            }

            // Get unread count (exclude messages sent by the current user)
            ChatUser currentChatUser = chatUserRepository.findByChatGroupIdAndUserId(group.getChatGroupId(), userId)
                    .orElse(null);
            
            Long unreadCount = 0L;
            if (currentChatUser != null && currentChatUser.getLastReadMessageId() != null) {
                // Count messages after lastReadMessageId that were NOT sent by the current user
                unreadCount = messages.stream()
                        .filter(msg -> msg.getChatMessageId() > currentChatUser.getLastReadMessageId())
                        .filter(msg -> !msg.getUserId().equals(userId))
                        .count();
            } else if (currentChatUser != null) {
                // Count all messages NOT sent by the current user
                unreadCount = messages.stream()
                        .filter(msg -> !msg.getUserId().equals(userId))
                        .count();
            }

            ChatGroupListItemDto dto = ChatGroupListItemDto.builder()
                    .chatGroupId(group.getChatGroupId())
                    .incidentId(group.getIncidentId())
                    .title(group.getTitle())
                    .createdAt(group.getCreatedAt())
                    .isClosed(group.getIsClosed())
                    .lastMessage(lastMessage)
                    .numberOfUnreadMessages(unreadCount)
                    .build();

            result.add(dto);
        }

        log.info("Found {} chat groups for user: {}", result.size(), userId);
        return result;
    }

    @Override
    @Transactional
    public void closeChatGroup(Long groupId) {
        log.info("Closing chat group: {}", groupId);

        ChatGroup chatGroup = chatGroupRepository.findById(groupId)
                .orElseThrow(() -> new ChatGroupNotFoundException(groupId));

        chatGroup.setIsClosed(true);
        chatGroupRepository.save(chatGroup);

        log.info("Chat group {} closed successfully", groupId);
    }

    private ChatGroupResponseDto mapToResponseDto(ChatGroup chatGroup) {
        return ChatGroupResponseDto.builder()
                .chatGroupId(chatGroup.getChatGroupId())
                .incidentId(chatGroup.getIncidentId())
                .title(chatGroup.getTitle())
                .createdAt(chatGroup.getCreatedAt())
                .isClosed(chatGroup.getIsClosed())
                .build();
    }
}
