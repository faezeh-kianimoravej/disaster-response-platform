package nl.saxion.disaster.chat_service.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.chat_service.dto.ChatMessageResponseDto;
import nl.saxion.disaster.chat_service.exception.ChatGroupNotFoundException;
import nl.saxion.disaster.chat_service.exception.ChatUserNotFoundException;
import nl.saxion.disaster.chat_service.model.ChatGroup;
import nl.saxion.disaster.chat_service.model.ChatMessage;
import nl.saxion.disaster.chat_service.model.ChatUser;
import nl.saxion.disaster.chat_service.model.MessageType;
import nl.saxion.disaster.chat_service.repository.ChatGroupRepository;
import nl.saxion.disaster.chat_service.repository.ChatMessageRepository;
import nl.saxion.disaster.chat_service.repository.ChatUserRepository;
import nl.saxion.disaster.chat_service.service.ChatMessageService;
import nl.saxion.disaster.chat_service.service.ChatSseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatMessageServiceImpl implements ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatGroupRepository chatGroupRepository;
    private final ChatUserRepository chatUserRepository;
    private final ChatSseService chatSseService;

    @Override
    @Transactional
    public ChatMessageResponseDto sendMessage(Long chatGroupId, Long userId, String content) {
        log.info("Sending message to group {} from user {}", chatGroupId, userId);

        // Verify chat group exists and is not closed
        ChatGroup chatGroup = chatGroupRepository.findById(chatGroupId)
                .orElseThrow(() -> new ChatGroupNotFoundException(chatGroupId));

        if (chatGroup.getIsClosed()) {
            throw new IllegalStateException("Cannot send message to closed chat group: " + chatGroupId);
        }

        // Verify user is part of the chat group
        ChatUser chatUser = chatUserRepository.findByChatGroupIdAndUserId(chatGroupId, userId)
                .orElseThrow(() -> new ChatUserNotFoundException(chatGroupId, userId));

        // Determine message type based on user role
        MessageType messageType = determineMessageType(chatUser.getUserRole());

        // Create and save message
        ChatMessage message = ChatMessage.builder()
                .chatGroupId(chatGroupId)
                .userId(userId)
                .content(content)
                .messageType(messageType)
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(message);
        log.info("Message {} sent to group {}", savedMessage.getChatMessageId(), chatGroupId);

        // Build response DTO
        ChatMessageResponseDto responseDto = mapToResponseDto(savedMessage, chatUser);

        // Send to SSE subscribers
        chatSseService.sendMessageToGroup(chatGroupId, responseDto);

        return responseDto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponseDto> getMessagesByGroupId(Long chatGroupId) {
        log.debug("Fetching messages for chat group {}", chatGroupId);

        // Verify chat group exists
        chatGroupRepository.findById(chatGroupId)
                .orElseThrow(() -> new ChatGroupNotFoundException(chatGroupId));

        List<ChatMessage> messages = chatMessageRepository.findByChatGroupIdOrderByTimestampAsc(chatGroupId);

        return messages.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponseDto> getMessagesAfterMessageId(Long chatGroupId, Long messageId) {
        log.debug("Fetching messages after {} for chat group {}", messageId, chatGroupId);

        // Verify chat group exists
        chatGroupRepository.findById(chatGroupId)
                .orElseThrow(() -> new ChatGroupNotFoundException(chatGroupId));

        List<ChatMessage> messages = chatMessageRepository.findByChatGroupIdOrderByTimestampAsc(chatGroupId);
        
        return messages.stream()
                .filter(msg -> msg.getChatMessageId() > messageId)
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    private ChatMessageResponseDto mapToResponseDto(ChatMessage message) {
        ChatUser chatUser = chatUserRepository.findByChatGroupIdAndUserId(
                message.getChatGroupId(), 
                message.getUserId()
        ).orElse(null);

        return mapToResponseDto(message, chatUser);
    }

    private ChatMessageResponseDto mapToResponseDto(ChatMessage message, ChatUser chatUser) {
        return ChatMessageResponseDto.builder()
                .chatMessageId(message.getChatMessageId())
                .chatGroupId(message.getChatGroupId())
                .userId(message.getUserId())
                .userFullName(chatUser != null ? chatUser.getUserFullName() : "Unknown User")
                .userRole(chatUser != null ? chatUser.getUserRole() : "Unknown")
                .messageType(message.getMessageType().name())
                .content(message.getContent())
                .timestamp(message.getTimestamp())
                .build();
    }

    /**
     * Determine message type based on user role.
     * Leaders (region/municipality/department admins) get LEADER type,
     * regular users get DEFAULT type.
     */
    private MessageType determineMessageType(String userRole) {
        if (userRole == null) {
            return MessageType.DEFAULT;
        }
        
        String role = userRole.toUpperCase();
        if (role.contains("RESPONDER")) {
            return MessageType.DEFAULT;
        }
        
        return MessageType.LEADER;
    }
}
