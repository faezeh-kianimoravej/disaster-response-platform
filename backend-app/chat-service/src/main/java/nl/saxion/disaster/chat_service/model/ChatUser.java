package nl.saxion.disaster.chat_service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chat_users")
@IdClass(ChatUserId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatUser {

    @Id
    @Column(name = "chat_group_id", nullable = false)
    private Long chatGroupId;

    @Id
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "user_full_name", nullable = false, length = 200)
    private String userFullName;

    @Column(name = "user_role", nullable = false, length = 50)
    private String userRole;

    @Column(name = "last_read_message_id")
    private Long lastReadMessageId;
}
