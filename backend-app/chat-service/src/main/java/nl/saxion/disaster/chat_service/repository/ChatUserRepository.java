package nl.saxion.disaster.chat_service.repository;

import nl.saxion.disaster.chat_service.model.ChatUser;
import nl.saxion.disaster.chat_service.model.ChatUserId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatUserRepository extends JpaRepository<ChatUser, ChatUserId> {

    List<ChatUser> findByChatGroupId(Long chatGroupId);

    List<ChatUser> findByUserId(Long userId);

    Optional<ChatUser> findByChatGroupIdAndUserId(Long chatGroupId, Long userId);
}
