package nl.saxion.disaster.chat_service.repository;

import nl.saxion.disaster.chat_service.model.ChatGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatGroupRepository extends JpaRepository<ChatGroup, Long> {

    Optional<ChatGroup> findByIncidentId(Long incidentId);

    Optional<ChatGroup> findByChatGroupIdAndIsClosed(Long chatGroupId, Boolean isClosed);

    @Query("SELECT DISTINCT cg FROM ChatGroup cg " +
           "WHERE cg.chatGroupId IN " +
           "(SELECT cu.chatGroupId FROM ChatUser cu WHERE cu.userId = :userId) " +
           "ORDER BY cg.createdAt DESC")
    List<ChatGroup> findAllByUserId(@Param("userId") Long userId);
}
