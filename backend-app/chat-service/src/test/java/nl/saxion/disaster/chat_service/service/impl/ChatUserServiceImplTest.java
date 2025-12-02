package nl.saxion.disaster.chat_service.service.impl;

import nl.saxion.disaster.chat_service.client.UserServiceClient;
import nl.saxion.disaster.chat_service.dto.ChatUserResponseDto;
import nl.saxion.disaster.chat_service.dto.UserBasicDTO;
import nl.saxion.disaster.chat_service.exception.ChatGroupNotFoundException;
import nl.saxion.disaster.chat_service.exception.UserNotFoundException;
import nl.saxion.disaster.chat_service.model.ChatGroup;
import nl.saxion.disaster.chat_service.model.ChatUser;
import nl.saxion.disaster.chat_service.repository.ChatGroupRepository;
import nl.saxion.disaster.chat_service.repository.ChatMessageRepository;
import nl.saxion.disaster.chat_service.repository.ChatUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChatUserService Tests")
class ChatUserServiceImplTest {

    @Mock
    private ChatUserRepository chatUserRepository;

    @Mock
    private ChatGroupRepository chatGroupRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private UserServiceClient userServiceClient;

    @InjectMocks
    private ChatUserServiceImpl chatUserService;

    private ChatGroup testChatGroup;
    private UserBasicDTO testUser;
    private ChatUser testChatUser;

    @BeforeEach
    void setUp() {
        testChatGroup = ChatGroup.builder()
                .chatGroupId(1L)
                .incidentId(100L)
                .title("Test Incident Chat")
                .isClosed(false)
                .build();

        testUser = UserBasicDTO.builder()
                .userId(1L)
                .fullName("John Doe")
                .role("REGION_ADMIN")
                .build();

        testChatUser = ChatUser.builder()
                .chatGroupId(1L)
                .userId(1L)
                .userFullName("John Doe")
                .userRole("REGION_ADMIN")
                .build();
    }

    @Test
    @DisplayName("Should add user to chat group successfully")
    void shouldAddUserToGroupSuccessfully() {
        // Given
        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(testChatGroup));
        when(userServiceClient.getUserById(1L)).thenReturn(Optional.of(testUser));
        when(chatUserRepository.save(any(ChatUser.class))).thenReturn(testChatUser);

        // When
        ChatUserResponseDto result = chatUserService.addUserToGroup(1L, 1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getChatGroupId()).isEqualTo(1L);
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getUserFullName()).isEqualTo("John Doe");
        assertThat(result.getUserRole()).isEqualTo("REGION_ADMIN");

        verify(chatGroupRepository).findById(1L);
        verify(userServiceClient).getUserById(1L);
        verify(chatUserRepository).save(any(ChatUser.class));
    }

    @Test
    @DisplayName("Should throw exception when chat group not found")
    void shouldThrowExceptionWhenChatGroupNotFound() {
        // Given
        when(chatGroupRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> chatUserService.addUserToGroup(999L, 1L))
                .isInstanceOf(ChatGroupNotFoundException.class);

        verify(chatGroupRepository).findById(999L);
        verify(userServiceClient, never()).getUserById(any());
        verify(chatUserRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when user not found in user service")
    void shouldThrowExceptionWhenUserNotFound() {
        // Given
        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(testChatGroup));
        when(userServiceClient.getUserById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> chatUserService.addUserToGroup(1L, 999L))
                .isInstanceOf(UserNotFoundException.class);

        verify(chatGroupRepository).findById(1L);
        verify(userServiceClient).getUserById(999L);
        verify(chatUserRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should remove user from chat group successfully")
    void shouldRemoveUserFromGroupSuccessfully() {
        // Given
        when(chatUserRepository.findById(any())).thenReturn(Optional.of(testChatUser));

        // When
        chatUserService.removeUserFromGroup(1L, 1L);

        // Then
        verify(chatUserRepository).findById(any());
        verify(chatUserRepository).delete(testChatUser);
    }

    @Test
    @DisplayName("Should update last read message successfully")
    void shouldUpdateLastReadMessageSuccessfully() {
        // Given
        when(chatUserRepository.findByChatGroupIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(testChatUser));
        when(chatUserRepository.save(any(ChatUser.class))).thenReturn(testChatUser);

        // When
        chatUserService.updateLastReadMessage(1L, 1L, 100L);

        // Then
        verify(chatUserRepository).findByChatGroupIdAndUserId(1L, 1L);
        verify(chatUserRepository).save(testChatUser);
        assertThat(testChatUser.getLastReadMessageId()).isEqualTo(100L);
    }
}
