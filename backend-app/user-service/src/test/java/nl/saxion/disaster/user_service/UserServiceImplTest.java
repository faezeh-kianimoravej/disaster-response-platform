package nl.saxion.disaster.user_service;

import nl.saxion.disaster.user_service.dto.RoleDto;
import nl.saxion.disaster.user_service.dto.UserRequestDto;
import nl.saxion.disaster.user_service.dto.UserResponseDto;
import nl.saxion.disaster.user_service.mapper.UserRequestMapper;
import nl.saxion.disaster.user_service.mapper.UserResponseMapper;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.model.enums.RoleType;
import nl.saxion.disaster.user_service.repository.contract.UserRepository;
import nl.saxion.disaster.user_service.service.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserServiceImpl (no DB or Spring context).
 * Focuses purely on service logic using Mockito.
 */
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserRequestMapper userRequestMapper;

    @Mock
    private UserResponseMapper userResponseMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User userEntity;
    private UserRequestDto requestDto;
    private UserResponseDto responseDto;
    private RoleDto roleDto;

    @BeforeEach
    void setUp() {
        roleDto = new RoleDto(RoleType.MUNICIPALITY_ADMIN, null, null, null);

        userEntity = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@example.com")
                .mobile("123456789")
                .password("encoded-pass")
                .deleted(false)
                .build();

        requestDto = new UserRequestDto(
                "John",
                "Doe",
                "john@example.com",
                "123456789",
                Set.of(roleDto),
                "plain-pass"
        );

        responseDto = new UserResponseDto(
                1L,
                "John",
                "Doe",
                "john@example.com",
                "123456789",
                false,
                Set.of(roleDto),
                null,
                null,
                null
        );
    }

    // ======================================================
    // CREATE USER TESTS
    // ======================================================

    @Test
    void createUser_ShouldThrowIllegalArgumentException_WhenRequestIsNull() {
        assertThatThrownBy(() -> userService.createUser(null))
                .as("Expect IllegalArgumentException when request is null")
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User request cannot be null");

        verifyNoInteractions(userRequestMapper, userResponseMapper, userRepository, passwordEncoder);
    }

    @Test
    void createUser_ShouldThrowException_WhenMappingFails() {
        // Arrange
        when(userRequestMapper.toEntity(requestDto)).thenReturn(Optional.empty());

        // Act + Assert
        assertThatThrownBy(() -> userService.createUser(requestDto))
                .as("Expect IllegalArgumentException when mapping fails")
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid user data");

        verify(userRequestMapper).toEntity(requestDto);
        verifyNoInteractions(userResponseMapper, userRepository, passwordEncoder);
    }

    @Test
    void createUser_ShouldEncodePassword_AndReturnResponseDto() {
        when(userRequestMapper.toEntity(requestDto)).thenReturn(Optional.of(userEntity));
        when(passwordEncoder.encode("plain-pass")).thenReturn("encoded-pass");
        when(userRepository.createUser(any(User.class))).thenReturn(userEntity);
        when(userResponseMapper.toDto(userEntity)).thenReturn(Optional.of(responseDto));

        UserResponseDto result = userService.createUser(requestDto);

        assertThat(result).isNotNull();
        assertThat(result.firstName()).isEqualTo("John");
        verify(passwordEncoder).encode("plain-pass");
        verify(userRepository).createUser(any(User.class));
        verify(userResponseMapper).toDto(userEntity);
    }

    // ======================================================
    // GET ALL ACTIVE USERS
    // ======================================================

    @Test
    void getAllActiveUsers_ShouldReturnNonDeletedUsers() {
        userEntity.setDeleted(false);
        when(userRepository.findAllActiveUsers()).thenReturn(List.of(userEntity));
        when(userResponseMapper.toDtoList(List.of(userEntity))).thenReturn(List.of(responseDto));

        List<UserResponseDto> result = userService.getAllActiveUsers();

        assertThat(result).isNotNull().hasSize(1);
        assertThat(result.get(0).email()).isEqualTo("john@example.com");

        verify(userRepository).findAllActiveUsers();
    }

    // ======================================================
    // GET BY ID
    // ======================================================

    @Test
    void getUserById_ShouldReturnDto_WhenUserExists() {
        when(userRepository.findUserById(1L)).thenReturn(Optional.of(userEntity));
        when(userResponseMapper.toDto(userEntity)).thenReturn(Optional.of(responseDto));

        Optional<UserResponseDto> result = userService.getUserById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().email()).isEqualTo("john@example.com");
        verify(userRepository).findUserById(1L);
    }

    @Test
    void getUserById_ShouldReturnEmpty_WhenNotFound() {
        when(userRepository.findUserById(1L)).thenReturn(Optional.empty());

        Optional<UserResponseDto> result = userService.getUserById(1L);

        assertThat(result).isEmpty();
        verify(userRepository).findUserById(1L);
    }

    // ======================================================
    // DELETE USER
    // ======================================================

    @Test
    void deleteUser_ShouldMarkAsDeleted_AndSave() {
        when(userRepository.findUserById(1L)).thenReturn(Optional.of(userEntity));

        userService.deleteUser(1L);

        assertThat(userEntity.isDeleted()).isTrue();
        verify(userRepository).createUser(userEntity);
    }

    @Test
    void deleteUser_ShouldThrow_WhenUserNotFound() {
        when(userRepository.findUserById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deleteUser(1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found");
    }
}
