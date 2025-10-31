package nl.saxion.disaster.user_service.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.saxion.disaster.user_service.dto.UserRequestDto;
import nl.saxion.disaster.user_service.dto.UserResponseDto;
import nl.saxion.disaster.user_service.service.contract.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@Tag(
        name = "User Management",
        description = "Endpoints for creating, reading, updating, and deleting users (with soft delete support)."
)
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @PostConstruct
    public void init() {
        log.info("[UserController] Initialized and ready to handle requests.");
    }

    // --------------------------------------------------------------------------------------------
    // Create User
    // --------------------------------------------------------------------------------------------
    @Operation(
            summary = "Create a new user",
            description = "Creates a new user with provided details and returns the created user."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User created successfully",
                    content = @Content(schema = @Schema(implementation = UserResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content)
    })
    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody UserRequestDto userRequestDto) {
        long start = System.currentTimeMillis();
        log.debug("[CREATE USER] Request received for email={}", userRequestDto.email());

        UserResponseDto createdUser = userService.createUser(userRequestDto);

        long duration = System.currentTimeMillis() - start;
        log.info("[CREATE USER] User created successfully with id={} ({} ms)", createdUser.id(), duration);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    // --------------------------------------------------------------------------------------------
    // Get All Active Users
    // --------------------------------------------------------------------------------------------
    @Operation(
            summary = "Get all active users",
            description = "Retrieves a list of all users that are not soft-deleted."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of users returned successfully",
                    content = @Content(schema = @Schema(implementation = UserResponseDto.class))),
    })
    @GetMapping
    public ResponseEntity<List<UserResponseDto>> getAllUsers() {
        long start = System.currentTimeMillis();
        log.debug("[GET USERS] Request received to list all active users.");

        List<UserResponseDto> users = userService.getAllActiveUsers();

        long duration = System.currentTimeMillis() - start;
        log.info("[GET USERS] Returned {} active users ({} ms).", users.size(), duration);
        return ResponseEntity.ok(users);
    }

    // --------------------------------------------------------------------------------------------
    // Get User by ID
    // --------------------------------------------------------------------------------------------
    @Operation(
            summary = "Get user by ID",
            description = "Fetches details of a single user by their unique ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User found successfully",
                    content = @Content(schema = @Schema(implementation = UserResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        long start = System.currentTimeMillis();
        log.debug("[GET USER] Request received for user ID={}", id);

        var response = userService.getUserById(id)
                .map(user -> {
                    log.info("[GET USER] Found user with id={} ({} ms)", id, System.currentTimeMillis() - start);
                    return ResponseEntity.ok(user);
                })
                .orElseGet(() -> {
                    log.warn("[GET USER] User with id={} not found ({} ms)", id, System.currentTimeMillis() - start);
                    return ResponseEntity.notFound().build();
                });

        return response;
    }

    // --------------------------------------------------------------------------------------------
    // USERS BY SCOPE
    // --------------------------------------------------------------------------------------------

    @GetMapping("/by-department/{departmentId}")
    @Operation(
            summary = "Get users belonging to a specific department",
            description = "Retrieves all active (non-deleted) users that are associated with the given department ID.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of users retrieved successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = UserResponseDto.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "No users found for this department"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    public ResponseEntity<List<UserResponseDto>> getUsersByDepartment(
            @Parameter(description = "Unique ID of the department", example = "5")
            @PathVariable Long departmentId) {

        log.info("Fetching users for department ID: {}", departmentId);
        List<UserResponseDto> users = userService.getUsersByDepartment(departmentId);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/by-municipality/{municipalityId}")
    @Operation(
            summary = "Get users belonging to a specific municipality",
            description = "Retrieves all active (non-deleted) users that are associated with the given municipality ID.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of users retrieved successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = UserResponseDto.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "No users found for this municipality"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    public ResponseEntity<List<UserResponseDto>> getUsersByMunicipality(
            @Parameter(description = "Unique ID of the municipality", example = "12")
            @PathVariable Long municipalityId) {

        log.info("Fetching users for municipality ID: {}", municipalityId);
        List<UserResponseDto> users = userService.getUsersByMunicipality(municipalityId);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/by-region/{regionId}")
    @Operation(
            summary = "Get users belonging to a specific region",
            description = "Retrieves all active (non-deleted) users that are associated with the given region ID.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "List of users retrieved successfully",
                            content = @Content(mediaType = "application/json",
                                    schema = @Schema(implementation = UserResponseDto.class))
                    ),
                    @ApiResponse(responseCode = "404", description = "No users found for this region"),
                    @ApiResponse(responseCode = "500", description = "Internal server error")
            }
    )
    public ResponseEntity<List<UserResponseDto>> getUsersByRegion(
            @Parameter(description = "Unique ID of the region", example = "3")
            @PathVariable Long regionId) {

        log.info("Fetching users for region ID: {}", regionId);
        List<UserResponseDto> users = userService.getUsersByRegion(regionId);
        return ResponseEntity.ok(users);
    }

    // --------------------------------------------------------------------------------------------
    // Update User
    // --------------------------------------------------------------------------------------------
    @Operation(
            summary = "Update existing user",
            description = "Updates an existing user's information by their ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User updated successfully",
                    content = @Content(schema = @Schema(implementation = UserResponseDto.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDto> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserRequestDto userRequestDto) {

        long start = System.currentTimeMillis();
        log.info("[UPDATE USER] Request received to update user ID={}", id);

        UserResponseDto updatedUser = userService.updateUser(id, userRequestDto);

        long duration = System.currentTimeMillis() - start;
        log.info("[UPDATE USER] User ID={} updated successfully ({} ms).", id, duration);
        return ResponseEntity.ok(updatedUser);
    }

    // --------------------------------------------------------------------------------------------
    // Delete (Soft Delete)
    // --------------------------------------------------------------------------------------------
    @Operation(
            summary = "Soft delete user",
            description = "Performs a soft delete on a user and their associated roles by ID."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "User deleted successfully (no content)",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        long start = System.currentTimeMillis();
        log.warn("[DELETE USER] Request received to soft delete user ID={}", id);

        userService.deleteUser(id);

        long duration = System.currentTimeMillis() - start;
        log.info("[DELETE USER] User ID={} soft deleted successfully ({} ms).", id, duration);
        return ResponseEntity.noContent().build();
    }
}
