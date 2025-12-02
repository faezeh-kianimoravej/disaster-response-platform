package nl.saxion.disaster.user_service.dto;

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
