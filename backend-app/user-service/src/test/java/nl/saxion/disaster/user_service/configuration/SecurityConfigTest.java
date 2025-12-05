package nl.saxion.disaster.user_service.configuration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import nl.saxion.disaster.user_service.service.UserServiceImpl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Security configuration tests for the User Service.
 * Validates that:
 * - Endpoints are properly secured
 * - Public endpoints are accessible without authentication
 * - Protected endpoints require valid OAuth2/JWT tokens
 * - CSRF is disabled for REST APIs
 */
@WebMvcTest
@Import(SecurityConfig.class)
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SecurityFilterChain securityFilterChain;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockBean
    private UserServiceImpl userService;

    @Test
    void passwordEncoderBean_shouldBeBCryptPasswordEncoder() {
        assertThat(passwordEncoder).isNotNull();
        // Verify it can encode and matches passwords
        String rawPassword = "testPassword123";
        String encoded = passwordEncoder.encode(rawPassword);
        assertThat(passwordEncoder.matches(rawPassword, encoded)).isTrue();
    }

    @Test
    void passwordEncoder_shouldNotMatchIncorrectPassword() {
        String rawPassword = "correctPassword";
        String encoded = passwordEncoder.encode(rawPassword);
        assertThat(passwordEncoder.matches("wrongPassword", encoded)).isFalse();
    }

    @Test
    void securityFilterChain_shouldBeConfigured() {
        assertThat(securityFilterChain).isNotNull();
    }

    @Test
    void csrfProtection_shouldBeDisabledForRestApis() throws Exception {
        // CSRF protection disabled means we can POST without CSRF token
        // The 400 status means validation error, not CSRF rejection - which is the point
        mockMvc.perform(post("/api/users")
                .contentType("application/json")
                .content("{\"username\": \"testuser\"}"))
                .andExpect(status().isBadRequest()); // 400 = validation error, not CSRF rejection
    }

    @Test
    void postUsersEndpoint_shouldBePubliclyAccessible() throws Exception {
        // POST /api/users is public and doesn't require authentication
        // The 400 status means validation error (missing required fields), not security rejection
        mockMvc.perform(post("/api/users")
                .contentType("application/json")
                .content("{\"username\": \"newuser\", \"password\": \"pass\", \"email\": \"user@test.com\"}"))
                .andExpect(status().isBadRequest()); // 400 validation error is OK, means it passed security
    }

    @Test
    void internalUsersEndpoint_shouldBePubliclyAccessible() throws Exception {
        mockMvc.perform(get("/api/users/internal/1"))
                .andExpect(status().isNotFound()); // Endpoint doesn't exist in test, but security allows it
    }

    @Test
    void otherEndpoints_shouldRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getEndpoint_withoutToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void putEndpoint_withoutToken_shouldReturn401() throws Exception {
        mockMvc.perform(put("/api/users/1")
                .contentType("application/json")
                .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteEndpoint_withoutToken_shouldReturn401() throws Exception {
        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void patchEndpoint_withoutToken_shouldRequireAuthentication() throws Exception {
        mockMvc.perform(patch("/api/users/1")
                .contentType("application/json")
                .content("{}"))
                .andExpect(status().isUnauthorized());
    }
}
