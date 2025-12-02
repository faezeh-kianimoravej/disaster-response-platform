package nl.saxion.disaster.chat_service.repository;

import nl.saxion.disaster.chat_service.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByChatGroupIdOrderByTimestampAsc(Long chatGroupId);

    Long countByChatGroupIdAndChatMessageIdGreaterThan(Long chatGroupId, Long messageId);
}
