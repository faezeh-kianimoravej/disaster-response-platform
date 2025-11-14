package nl.saxion.disaster.user_service;

import nl.saxion.disaster.user_service.dto.RoleDto;
import nl.saxion.disaster.user_service.dto.UserRequestDto;
import nl.saxion.disaster.user_service.dto.UserResponseDto;
import nl.saxion.disaster.user_service.dto.ResponderProfileDto;
import nl.saxion.disaster.user_service.mapper.UserRequestMapper;
import nl.saxion.disaster.user_service.mapper.UserResponseMapper;
import nl.saxion.disaster.user_service.mapper.RoleMapper;
import nl.saxion.disaster.user_service.mapper.ResponderProfileMapper;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.model.enums.RoleType;
import nl.saxion.disaster.user_service.model.enums.ResponderSpecialization;
import nl.saxion.disaster.user_service.repository.contract.UserRepository;
import nl.saxion.disaster.user_service.repository.contract.ResponderProfileRepository;
import nl.saxion.disaster.user_service.service.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private UserResponseMapper userResponseMapper;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private RoleMapper roleMapper;
    @Mock
    private ResponderProfileMapper responderProfileMapper;
    @Mock
    private ResponderProfileRepository responderProfileRepository;

    private UserServiceImpl userService;
    private UserRequestMapper realUserRequestMapper;

    private User userEntity;
    private UserRequestDto requestDto;
    private UserResponseDto responseDto;
    private RoleDto roleDto;
    private RoleDto responderRoleDto;
    private ResponderProfileDto responderProfileDto;

    @BeforeEach
    void setUp() {
        roleDto = new RoleDto(RoleType.MUNICIPALITY_ADMIN, null, null, null);
        responderRoleDto = new RoleDto(RoleType.RESPONDER, 1L, null, null);
        responderProfileDto = new ResponderProfileDto(
            1L,
            1L,
            ResponderSpecialization.FIREFIGHTER,
            List.of(ResponderSpecialization.DRIVER),
            true,
            null
        );

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
                null,
                "plain-pass"
        );

        responseDto = mock(UserResponseDto.class);

        // Use a real UserRequestMapper for mapping logic tests
        realUserRequestMapper = new UserRequestMapper(roleMapper, responderProfileMapper);
        userService = new UserServiceImpl(
            userRepository,
            realUserRequestMapper,
            userResponseMapper,
            passwordEncoder,
            responderProfileRepository,
            responderProfileMapper
        );
    }

    @Test
    void createUser_ShouldThrowIllegalArgumentException_WhenRequestIsNull() {
        assertThatThrownBy(() -> userService.createUser(null))
                .as("Expect IllegalArgumentException when request is null")
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User request cannot be null");

        verifyNoInteractions(userResponseMapper, userRepository, passwordEncoder);
    }

    @Test
    void createUser_ShouldThrow_WhenResponderRoleWithoutProfile() {
        UserRequestDto req = new UserRequestDto(
            "Jane",
            "Smith",
            "jane@example.com",
            "987654321",
            Set.of(responderRoleDto),
            null,
            "plain-pass"
        );
        // roleMapper.toEntity returns a dummy UserRole with RESPONDER type
        when(roleMapper.toEntity(any())).thenAnswer(invocation -> {
            RoleDto dto = invocation.getArgument(0);
            return nl.saxion.disaster.user_service.model.entity.UserRole.builder()
                .roleType(dto.roleType())
                .deleted(false)
                .build();
        });
        assertThatThrownBy(() -> userService.createUser(req))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("responder profile");
    }

    @Test
    void createUser_ShouldSucceed_WithResponderRoleAndProfile() {
        UserRequestDto req = new UserRequestDto(
            "Jane",
            "Smith",
            "jane@example.com",
            "987654321",
            Set.of(responderRoleDto),
            responderProfileDto,
            "plain-pass"
        );
        // roleMapper.toEntity returns a dummy UserRole with RESPONDER type
        when(roleMapper.toEntity(any())).thenAnswer(invocation -> {
            RoleDto dto = invocation.getArgument(0);
            return nl.saxion.disaster.user_service.model.entity.UserRole.builder()
                .roleType(dto.roleType())
                .deleted(false)
                .build();
        });
        // responderProfileMapper.toEntity returns a dummy profile
        when(responderProfileMapper.toEntity(any(), any())).thenReturn(
            nl.saxion.disaster.user_service.model.entity.ResponderProfile.builder()
                .departmentId(1L)
                .primarySpecialization(ResponderSpecialization.FIREFIGHTER)
                .secondarySpecializations(List.of(ResponderSpecialization.DRIVER))
                .isAvailable(true)
                .currentDeploymentId(null)
                .build()
        );
        when(passwordEncoder.encode("plain-pass")).thenReturn("encoded-pass");
        when(userRepository.createUser(any(User.class))).thenReturn(userEntity);
        when(userResponseMapper.toDto(userEntity)).thenReturn(Optional.of(responseDto));

        UserResponseDto result = userService.createUser(req);
        assertThat(result).isNotNull();
        verify(passwordEncoder).encode("plain-pass");
        verify(userRepository).createUser(any(User.class));
        verify(userResponseMapper).toDto(userEntity);
    }

    @Test
    void deleteUser_ShouldMarkAsDeleted_AndSave() {
        User user = User.builder()
            .id(1L)
            .firstName("John")
            .lastName("Doe")
            .email("john@example.com")
            .mobile("123456789")
            .password("encoded-pass")
            .deleted(false)
            .build();
        when(userRepository.findUserById(1L)).thenReturn(Optional.of(user));
        when(userRepository.createUser(user)).thenReturn(user); // Service uses createUser for update
        doNothing().when(responderProfileRepository).deleteByUserId(1L);

        userService.deleteUser(1L);

        assertThat(user.isDeleted()).isTrue();
        verify(userRepository).createUser(user);
        verify(responderProfileRepository).deleteByUserId(1L);
    }
}
