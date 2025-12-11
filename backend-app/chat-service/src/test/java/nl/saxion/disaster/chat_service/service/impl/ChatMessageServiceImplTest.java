package nl.saxion.disaster.chat_service.service.impl;

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
import nl.saxion.disaster.chat_service.service.ChatSseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChatMessageService Tests")
class ChatMessageServiceImplTest {

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private ChatGroupRepository chatGroupRepository;

    @Mock
    private ChatUserRepository chatUserRepository;

    @Mock
    private ChatSseService chatSseService;

    @InjectMocks
    private ChatMessageServiceImpl chatMessageService;

    private ChatGroup testChatGroup;
    private ChatUser regularUser;
    private ChatUser leaderUser;
    private ChatMessage testMessage;

    @BeforeEach
    void setUp() {
        testChatGroup = ChatGroup.builder()
                .chatGroupId(1L)
                .incidentId(100L)
                .title("Test Incident Chat")
                .isClosed(false)
                .build();

        regularUser = ChatUser.builder()
                .chatGroupId(1L)
                .userId(1L)
                .userFullName("John Doe")
                .userRole("FIRST_RESPONDER")
                .build();

        leaderUser = ChatUser.builder()
                .chatGroupId(1L)
                .userId(2L)
                .userFullName("Jane Smith")
                .userRole("REGION_ADMIN")
                .build();

        testMessage = ChatMessage.builder()
                .chatMessageId(1L)
                .chatGroupId(1L)
                .userId(1L)
                .content("Test message")
                .messageType(MessageType.DEFAULT)
                .timestamp(Instant.now())
                .build();
    }

    @Test
    @DisplayName("Should send message successfully with DEFAULT type for regular user")
    void shouldSendMessageWithDefaultType() {
        // Given
        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(testChatGroup));
        when(chatUserRepository.findByChatGroupIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(regularUser));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(testMessage);

        // When
        ChatMessageResponseDto result = chatMessageService.sendMessage(1L, 1L, "Test message");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getChatGroupId()).isEqualTo(1L);
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getContent()).isEqualTo("Test message");
        assertThat(result.getMessageType()).isEqualTo(MessageType.DEFAULT.name());

        ArgumentCaptor<ChatMessage> messageCaptor = ArgumentCaptor.forClass(ChatMessage.class);
        verify(chatMessageRepository).save(messageCaptor.capture());
        assertThat(messageCaptor.getValue().getMessageType()).isEqualTo(MessageType.DEFAULT);
        verify(chatSseService).sendMessageToGroup(eq(1L), any(ChatMessageResponseDto.class));
    }

    @Test
    @DisplayName("Should send message successfully with LEADER type for admin user")
    void shouldSendMessageWithLeaderType() {
        // Given
        ChatMessage leaderMessage = ChatMessage.builder()
                .chatMessageId(2L)
                .chatGroupId(1L)
                .userId(2L)
                .content("Leader message")
                .messageType(MessageType.LEADER)
                .timestamp(Instant.now())
                .build();

        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(testChatGroup));
        when(chatUserRepository.findByChatGroupIdAndUserId(1L, 2L))
                .thenReturn(Optional.of(leaderUser));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(leaderMessage);

        // When
        ChatMessageResponseDto result = chatMessageService.sendMessage(1L, 2L, "Leader message");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getMessageType()).isEqualTo(MessageType.LEADER.name());
        assertThat(result.getUserRole()).isEqualTo("REGION_ADMIN");

        ArgumentCaptor<ChatMessage> messageCaptor = ArgumentCaptor.forClass(ChatMessage.class);
        verify(chatMessageRepository).save(messageCaptor.capture());
        assertThat(messageCaptor.getValue().getMessageType()).isEqualTo(MessageType.LEADER);
    }

    @Test
    @DisplayName("Should throw exception when sending message to closed chat group")
    void shouldThrowExceptionWhenChatGroupClosed() {
        // Given
        ChatGroup closedGroup = ChatGroup.builder()
                .chatGroupId(1L)
                .incidentId(100L)
                .title("Closed Chat")
                .isClosed(true)
                .build();

        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(closedGroup));

        // When & Then
        assertThatThrownBy(() -> chatMessageService.sendMessage(1L, 1L, "Test message"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot send message to closed chat group");

        verify(chatMessageRepository, never()).save(any());
        verify(chatSseService, never()).sendMessageToGroup(any(), any());
    }

    @Test
    @DisplayName("Should throw exception when chat group not found")
    void shouldThrowExceptionWhenChatGroupNotFound() {
        // Given
        when(chatGroupRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> chatMessageService.sendMessage(999L, 1L, "Test message"))
                .isInstanceOf(ChatGroupNotFoundException.class);

        verify(chatMessageRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when user not in chat group")
    void shouldThrowExceptionWhenUserNotInGroup() {
        // Given
        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(testChatGroup));
        when(chatUserRepository.findByChatGroupIdAndUserId(1L, 999L))
                .thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> chatMessageService.sendMessage(1L, 999L, "Test message"))
                .isInstanceOf(ChatUserNotFoundException.class);

        verify(chatMessageRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should get all messages for chat group")
    void shouldGetMessagesByGroupId() {
        // Given
        List<ChatMessage> messages = List.of(testMessage);
        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(testChatGroup));
        when(chatMessageRepository.findByChatGroupIdOrderByTimestampAsc(1L)).thenReturn(messages);
        when(chatUserRepository.findByChatGroupIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(regularUser));

        // When
        List<ChatMessageResponseDto> result = chatMessageService.getMessagesByGroupId(1L);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getContent()).isEqualTo("Test message");
        verify(chatGroupRepository).findById(1L);
        verify(chatMessageRepository).findByChatGroupIdOrderByTimestampAsc(1L);
    }

    @Test
    @DisplayName("Should get messages after specific message ID")
    void shouldGetMessagesAfterMessageId() {
        // Given
        ChatMessage message1 = ChatMessage.builder()
                .chatMessageId(1L)
                .chatGroupId(1L)
                .userId(1L)
                .content("Message 1")
                .messageType(MessageType.DEFAULT)
                .timestamp(Instant.now())
                .build();

        ChatMessage message2 = ChatMessage.builder()
                .chatMessageId(2L)
                .chatGroupId(1L)
                .userId(1L)
                .content("Message 2")
                .messageType(MessageType.DEFAULT)
                .timestamp(Instant.now())
                .build();

        List<ChatMessage> allMessages = List.of(message1, message2);

        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(testChatGroup));
        when(chatMessageRepository.findByChatGroupIdOrderByTimestampAsc(1L)).thenReturn(allMessages);
        when(chatUserRepository.findByChatGroupIdAndUserId(eq(1L), eq(1L)))
                .thenReturn(Optional.of(regularUser));

        // When
        List<ChatMessageResponseDto> result = chatMessageService.getMessagesAfterMessageId(1L, 1L);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getChatMessageId()).isEqualTo(2L);
        assertThat(result.get(0).getContent()).isEqualTo("Message 2");
    }
}
