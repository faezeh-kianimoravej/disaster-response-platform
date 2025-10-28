package nl.saxion.disaster.user_service.service.contract;


import nl.saxion.disaster.user_service.dto.UserDto;

import java.util.List;
import java.util.Optional;

public interface UserService {

    /**
     * Creates a new user.
     *
     * @param userDto DTO containing user data
     * @return created User as DTO
     */
    UserDto createUser(UserDto userDto);

    /**
     * Retrieves all active (non-deleted) users.
     *
     * @return list of active users as DTOs
     */
    List<UserDto> getAllActiveUsers();

    /**
     * Retrieves a user by ID.
     *
     * @param id user's ID
     * @return optional of UserDto
     */
    Optional<UserDto> getUserById(Long id);

    /**
     * Updates a user.
     *
     * @param id         ID of the user to update
     * @param updatedDto updated data as DTO
     * @return updated user as DTO
     */
    UserDto updateUser(Long id, UserDto updatedDto);

    /**
     * Performs a soft delete for the user.
     *
     * @param id ID of the user to delete
     */
    void deleteUser(Long id);
}
