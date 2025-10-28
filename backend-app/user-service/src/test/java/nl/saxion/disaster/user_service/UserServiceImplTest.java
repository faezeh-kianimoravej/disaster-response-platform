package nl.saxion.disaster.user_service;

import nl.saxion.disaster.user_service.dto.UserDto;
import nl.saxion.disaster.user_service.mapper.RoleMapper;
import nl.saxion.disaster.user_service.mapper.UserMapper;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.repository.contract.UserRepository;
import nl.saxion.disaster.user_service.service.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * Unit tests for UserServiceImpl using Mockito (no DB or Spring Context).
 */
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private RoleMapper roleMapper;

    @InjectMocks
    private UserServiceImpl userService;

    private User userEntity;
    private UserDto userDto;

    @BeforeEach
    void setUp() {
        userEntity = new User();
        userEntity.setId(1L);
        userEntity.setFirstName("John");
        userEntity.setLastName("Doe");
        userEntity.setEmail("john@example.com");
        userEntity.setMobile("123456789");
        userEntity.setPassword("password");
        userEntity.setDeleted(false);

        userDto = new UserDto(1L, "John", "Doe", "john@example.com", "123456789", "password", List.of());
    }

    @Test
    void createUser_ShouldSaveAndReturnDto() {
        when(userMapper.toEntity(userDto)).thenReturn(Optional.of(userEntity));
        when(userRepository.createUser(userEntity)).thenReturn(userEntity);
        when(userMapper.toDto(userEntity)).thenReturn(Optional.of(userDto));

        UserDto result = userService.createUser(userDto);

        assertThat(result).isNotNull();
        assertThat(result.firstName()).isEqualTo("John");
        verify(userRepository, times(1)).createUser(any(User.class));
        verify(userMapper, times(1)).toDto(userEntity);
    }

    @Test
    void getAllActiveUsers_ShouldReturnListOfDtos() {
        when(userRepository.findAllActiveUsers()).thenReturn(List.of(userEntity));
        when(userMapper.toDto(userEntity)).thenReturn(Optional.of(userDto));

        List<UserDto> result = userService.getAllActiveUsers();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).email()).isEqualTo("john@example.com");
        verify(userRepository).findAllActiveUsers();
    }

    @Test
    void getUserById_ShouldReturnUserDto_WhenUserExists() {
        when(userRepository.findUserById(1L)).thenReturn(Optional.of(userEntity));
        when(userMapper.toDto(userEntity)).thenReturn(Optional.of(userDto));

        Optional<UserDto> result = userService.getUserById(1L);

        assertThat(result).isPresent();
        assertThat(result.get().email()).isEqualTo("john@example.com");
        verify(userRepository).findUserById(1L);
    }


    @Test
    void getUserById_ShouldReturnEmpty_WhenUserDoesNotExist() {
        when(userRepository.findUserById(1L)).thenReturn(Optional.empty());

        Optional<UserDto> result = userService.getUserById(1L);

        assertThat(result).isEmpty();
        verify(userRepository).findUserById(1L);
    }


    @Test
    void updateUser_ShouldUpdateFieldsAndReturnUpdatedDto() {
        UserDto updatedDto = new UserDto(1L, "Jane", "Doe", "jane@example.com", "987654321", "newpass", List.of());
        when(userRepository.findUserById(1L)).thenReturn(Optional.of(userEntity));
        when(userRepository.createUser(any(User.class))).thenReturn(userEntity);
        when(userMapper.toDto(userEntity)).thenReturn(Optional.of(updatedDto));

        UserDto result = userService.updateUser(1L, updatedDto);

        assertThat(result.firstName()).isEqualTo("Jane");
        assertThat(result.email()).isEqualTo("jane@example.com");
        verify(userRepository).createUser(any(User.class));
    }

    @Test
    void updateUser_ShouldThrowException_WhenUserNotFound() {
        when(userRepository.findUserById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.updateUser(1L, userDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User not found or deleted");
    }

    @Test
    void deleteUser_ShouldMarkUserAsDeleted() {
        userEntity.setRoles(Set.of());
        when(userRepository.findUserById(1L)).thenReturn(Optional.of(userEntity));

        userService.deleteUser(1L);

        assertThat(userEntity.isDeleted()).isTrue();
        verify(userRepository).createUser(userEntity);
    }

    @Test
    void deleteUser_ShouldNotSave_WhenAlreadyDeleted() {
        userEntity.setDeleted(true);
        when(userRepository.findUserById(1L)).thenReturn(Optional.of(userEntity));

        userService.deleteUser(1L);

        verify(userRepository, never()).createUser(any());
    }

    @Test
    void createUser_ShouldThrowException_WhenDtoIsNull() {
        when(userMapper.toEntity(null)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.createUser(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User DTO cannot be null");
    }
}
