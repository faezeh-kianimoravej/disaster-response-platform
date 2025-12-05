package nl.saxion.disaster.chat_service.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.chat_service.client.UserServiceClient;
import nl.saxion.disaster.chat_service.dto.ChatUserResponseDto;
import nl.saxion.disaster.chat_service.dto.UserBasicDTO;
import nl.saxion.disaster.chat_service.exception.ChatGroupNotFoundException;
import nl.saxion.disaster.chat_service.exception.ChatUserNotFoundException;
import nl.saxion.disaster.chat_service.exception.UserNotFoundException;
import nl.saxion.disaster.chat_service.model.ChatGroup;
import nl.saxion.disaster.chat_service.model.ChatUser;
import nl.saxion.disaster.chat_service.model.ChatUserId;
import nl.saxion.disaster.chat_service.repository.ChatGroupRepository;
import nl.saxion.disaster.chat_service.repository.ChatMessageRepository;
import nl.saxion.disaster.chat_service.repository.ChatUserRepository;
import nl.saxion.disaster.chat_service.service.ChatUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatUserServiceImpl implements ChatUserService {

    private final ChatUserRepository chatUserRepository;
    private final ChatGroupRepository chatGroupRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserServiceClient userServiceClient;

    @Override
    @Transactional
    public ChatUserResponseDto addUserToGroup(Long chatGroupId, Long userId) {
        log.info("Adding user {} to chat group {}", userId, chatGroupId);

        // Verify chat group exists
        ChatGroup chatGroup = chatGroupRepository.findById(chatGroupId)
                .orElseThrow(() -> new ChatGroupNotFoundException(chatGroupId));

        // Fetch user details from user-service
        UserBasicDTO user = userServiceClient.getUserById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        // Get user info from basicDTO
        String fullName = user.getFullName();
        String role = user.getRole();

        // Create ChatUser
        ChatUser chatUser = ChatUser.builder()
                .chatGroupId(chatGroupId)
                .userId(userId)
                .userFullName(fullName)
                .userRole(role)
                .build();

        ChatUser savedChatUser = chatUserRepository.save(chatUser);
        log.info("User {} added to chat group {}", userId, chatGroupId);

        return mapToResponseDto(savedChatUser);
    }

    @Override
    @Transactional
    public void removeUserFromGroup(Long chatGroupId, Long userId) {
        log.info("Removing user {} from chat group {}", userId, chatGroupId);

        ChatUserId id = new ChatUserId(chatGroupId, userId);
        ChatUser chatUser = chatUserRepository.findById(id)
                .orElseThrow(() -> new ChatUserNotFoundException(chatGroupId, userId));

        chatUserRepository.delete(chatUser);
        log.info("User {} removed from chat group {}", userId, chatGroupId);
    }

    @Override
    @Transactional
    public void updateLastReadMessage(Long chatGroupId, Long userId, Long messageId) {
        log.debug("Updating last read message for user {} in group {} to message {}", 
                userId, chatGroupId, messageId);

        ChatUser chatUser = chatUserRepository.findByChatGroupIdAndUserId(chatGroupId, userId)
                .orElseThrow(() -> new ChatUserNotFoundException(chatGroupId, userId));

        chatUser.setLastReadMessageId(messageId);
        chatUserRepository.save(chatUser);

        log.debug("Last read message updated for user {} in group {}", userId, chatGroupId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatUserResponseDto> getUsersInGroup(Long chatGroupId) {
        log.debug("Fetching users in chat group {}", chatGroupId);

        List<ChatUser> chatUsers = chatUserRepository.findByChatGroupId(chatGroupId);
        
        return chatUsers.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadMessageCount(Long chatGroupId, Long userId) {
        log.debug("Getting unread message count for user {} in group {}", userId, chatGroupId);

        ChatUser chatUser = chatUserRepository.findByChatGroupIdAndUserId(chatGroupId, userId)
                .orElseThrow(() -> new ChatUserNotFoundException(chatGroupId, userId));

        if (chatUser.getLastReadMessageId() == null) {
            // Never read any message, count all messages
            return (long) chatMessageRepository.findByChatGroupIdOrderByTimestampAsc(chatGroupId).size();
        }

        return chatMessageRepository.countByChatGroupIdAndChatMessageIdGreaterThan(
                chatGroupId, 
                chatUser.getLastReadMessageId()
        );
    }

    private ChatUserResponseDto mapToResponseDto(ChatUser chatUser) {
        return ChatUserResponseDto.builder()
                .chatGroupId(chatUser.getChatGroupId())
                .userId(chatUser.getUserId())
                .userFullName(chatUser.getUserFullName())
                .userRole(chatUser.getUserRole())
                .lastReadMessageId(chatUser.getLastReadMessageId())
                .build();
    }
}
