package nl.saxion.disaster.chat_service.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBasicDTO {
    private Long userId;
    private String fullName;
    private String role;
}
