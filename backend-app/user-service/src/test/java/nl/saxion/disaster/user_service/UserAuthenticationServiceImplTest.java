package nl.saxion.disaster.user_service;

import nl.saxion.disaster.user_service.dto.LoginRequestDto;
import nl.saxion.disaster.user_service.dto.LoginResponseDto;
import nl.saxion.disaster.user_service.dto.RoleDto;
import nl.saxion.disaster.user_service.exception.InvalidCredentialsException;
import nl.saxion.disaster.user_service.mapper.RoleMapper;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.model.entity.UserRole;
import nl.saxion.disaster.user_service.model.enums.RoleType;
import nl.saxion.disaster.user_service.repository.contract.UserRepository;
import nl.saxion.disaster.user_service.security.JwtUtil;
import nl.saxion.disaster.user_service.service.UserAuthenticationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserAuthenticationServiceImpl
 */
@ExtendWith(MockitoExtension.class)
class UserAuthenticationServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private RoleMapper roleMapper;

    @InjectMocks
    private UserAuthenticationServiceImpl authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        UserRole role = UserRole.builder()
                .id(1L)
                .roleType(RoleType.REGION_ADMIN)
                .regionId(3L)
                .build();

        testUser = User.builder()
                .id(1L)
                .email("alice.johnson@example.com")
                .password("$2a$10$hashedPassword12345")
                .roles(Set.of(role))
                .build();
    }

    // Successful login
    @Test
    void login_ShouldReturnToken_WhenCredentialsAreValid() {
        // given
        LoginRequestDto request = new LoginRequestDto("alice.johnson@example.com", "F@ezeh10396");

        when(userRepository.findUserByEmail(request.email())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.password(), testUser.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(testUser)).thenReturn("mocked-jwt-token");
        when(roleMapper.toDto(any(UserRole.class)))
                .thenReturn(new RoleDto(RoleType.REGION_ADMIN, null, null, 3L));

        // when
        LoginResponseDto response = authService.login(request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.email()).isEqualTo("alice.johnson@example.com");
        assertThat(response.token()).isEqualTo("mocked-jwt-token");
        assertThat(response.roles()).hasSize(1);
        verify(userRepository, times(1)).findUserByEmail(request.email());
        verify(passwordEncoder, times(1)).matches(anyString(), anyString());
        verify(jwtUtil, times(1)).generateToken(any(User.class));
    }

    // Login fails when email not found
    @Test
    void login_ShouldThrowException_WhenEmailNotFound() {
        // given
        LoginRequestDto request = new LoginRequestDto("unknown@example.com", "pass123");
        when(userRepository.findUserByEmail(request.email())).thenReturn(Optional.empty());

        // when / then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("No user found with the given email address.");
    }

    // Login fails when password is invalid
    @Test
    void login_ShouldThrowException_WhenPasswordIsIncorrect() {
        // given
        LoginRequestDto request = new LoginRequestDto("alice.johnson@example.com", "wrongPassword");
        when(userRepository.findUserByEmail(request.email())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.password(), testUser.getPassword())).thenReturn(false);

        // when / then
        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Incorrect password");
    }
}

