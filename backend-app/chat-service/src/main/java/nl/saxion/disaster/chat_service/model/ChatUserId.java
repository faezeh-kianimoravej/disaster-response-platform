package nl.saxion.disaster.chat_service.model;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ChatUserId implements Serializable {

    private Long chatGroupId;
    private Long userId;
}
