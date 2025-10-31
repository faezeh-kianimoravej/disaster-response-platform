package nl.saxion.disaster.user_service.service.contract;

import nl.saxion.disaster.user_service.dto.UserRequestDto;
import nl.saxion.disaster.user_service.dto.UserResponseDto;

import java.util.List;
import java.util.Optional;

/**
 * Contract for managing users within the system.
 * <p>
 * This interface separates input (UserRequestDto) and output (UserResponseDto)
 * for clear API boundaries between layers.
 */
public interface UserService {

    /**
     * Creates a new user.
     *
     * @param requestDto DTO containing user data from the client
     * @return created User as a response DTO
     */
    UserResponseDto createUser(UserRequestDto requestDto);

    /**
     * Retrieves all active (non-deleted) users.
     *
     * @return list of active users as response DTOs
     */
    List<UserResponseDto> getAllActiveUsers();

    /**
     * Retrieves a user by ID.
     *
     * @param id user's ID
     * @return optional of UserResponseDto
     */
    Optional<UserResponseDto> getUserById(Long id);

    /**
     * Updates a user.
     *
     * @param id         ID of the user to update
     * @param requestDto updated data as request DTO
     * @return updated user as a response DTO
     */
    UserResponseDto updateUser(Long id, UserRequestDto requestDto);

    /**
     * Performs a soft delete for the user.
     *
     * @param id ID of the user to delete
     */
    void deleteUser(Long id);

    // ------------------- 🔽 New methods for scoped user retrieval -------------------

    /**
     * Retrieves all users belonging to a specific department.
     *
     * @param departmentId ID of the department
     * @return list of users as response DTOs
     */
    List<UserResponseDto> getUsersByDepartment(Long departmentId);

    /**
     * Retrieves all users belonging to a specific municipality.
     *
     * @param municipalityId ID of the municipality
     * @return list of users as response DTOs
     */
    List<UserResponseDto> getUsersByMunicipality(Long municipalityId);

    /**
     * Retrieves all users belonging to a specific region.
     *
     * @param regionId ID of the region
     * @return list of users as response DTOs
     */
    List<UserResponseDto> getUsersByRegion(Long regionId);
}