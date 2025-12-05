package nl.saxion.disaster.chat_service.service.impl;

import nl.saxion.disaster.chat_service.dto.ChatGroupResponseDto;
import nl.saxion.disaster.chat_service.exception.ChatGroupNotFoundException;
import nl.saxion.disaster.chat_service.model.ChatGroup;
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

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("ChatGroupService Tests")
class ChatGroupServiceImplTest {

    @Mock
    private ChatGroupRepository chatGroupRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private ChatUserRepository chatUserRepository;

    @InjectMocks
    private ChatGroupServiceImpl chatGroupService;

    private ChatGroup testChatGroup;

    @BeforeEach
    void setUp() {
        testChatGroup = ChatGroup.builder()
                .chatGroupId(1L)
                .incidentId(100L)
                .title("Test Incident Chat")
                .createdAt(LocalDateTime.now())
                .isClosed(false)
                .build();
    }

    @Test
    @DisplayName("Should create new chat group for incident")
    void shouldCreateNewChatGroup() {
        // Given
        when(chatGroupRepository.findByIncidentId(100L)).thenReturn(Optional.empty());
        when(chatGroupRepository.save(any(ChatGroup.class))).thenReturn(testChatGroup);

        // When
        ChatGroupResponseDto result = chatGroupService.createChatGroupForIncident(100L, "Test Incident Chat");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getChatGroupId()).isEqualTo(1L);
        assertThat(result.getIncidentId()).isEqualTo(100L);
        assertThat(result.getTitle()).isEqualTo("Test Incident Chat");
        assertThat(result.getIsClosed()).isFalse();

        verify(chatGroupRepository).findByIncidentId(100L);
        verify(chatGroupRepository).save(any(ChatGroup.class));
    }

    @Test
    @DisplayName("Should return existing chat group if one already exists for incident")
    void shouldReturnExistingChatGroupForIncident() {
        // Given
        when(chatGroupRepository.findByIncidentId(100L)).thenReturn(Optional.of(testChatGroup));

        // When
        ChatGroupResponseDto result = chatGroupService.createChatGroupForIncident(100L, "New Title");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getChatGroupId()).isEqualTo(1L);
        assertThat(result.getIncidentId()).isEqualTo(100L);
        assertThat(result.getTitle()).isEqualTo("Test Incident Chat"); // Original title, not "New Title"

        verify(chatGroupRepository).findByIncidentId(100L);
        verify(chatGroupRepository, never()).save(any(ChatGroup.class));
    }

    @Test
    @DisplayName("Should get chat group by ID")
    void shouldGetChatGroupById() {
        // Given
        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(testChatGroup));

        // When
        ChatGroupResponseDto result = chatGroupService.getChatGroupById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getChatGroupId()).isEqualTo(1L);
        assertThat(result.getIncidentId()).isEqualTo(100L);

        verify(chatGroupRepository).findById(1L);
    }

    @Test
    @DisplayName("Should throw exception when chat group not found")
    void shouldThrowExceptionWhenChatGroupNotFound() {
        // Given
        when(chatGroupRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> chatGroupService.getChatGroupById(999L))
                .isInstanceOf(ChatGroupNotFoundException.class);

        verify(chatGroupRepository).findById(999L);
    }

    @Test
    @DisplayName("Should close chat group")
    void shouldCloseChatGroup() {
        // Given
        when(chatGroupRepository.findById(1L)).thenReturn(Optional.of(testChatGroup));
        when(chatGroupRepository.save(any(ChatGroup.class))).thenReturn(testChatGroup);

        // When
        chatGroupService.closeChatGroup(1L);

        // Then
        assertThat(testChatGroup.getIsClosed()).isTrue();
        verify(chatGroupRepository).findById(1L);
        verify(chatGroupRepository).save(testChatGroup);
    }

    @Test
    @DisplayName("Should throw exception when trying to close non-existent chat group")
    void shouldThrowExceptionWhenClosingNonExistentGroup() {
        // Given
        when(chatGroupRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> chatGroupService.closeChatGroup(999L))
                .isInstanceOf(ChatGroupNotFoundException.class);

        verify(chatGroupRepository).findById(999L);
        verify(chatGroupRepository, never()).save(any());
    }
}
