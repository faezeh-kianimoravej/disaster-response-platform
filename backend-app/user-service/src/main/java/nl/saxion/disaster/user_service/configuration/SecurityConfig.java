package nl.saxion.disaster.user_service.configuration;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Main Spring Security configuration.
 * This class:
 * - Registers the JWT filter
 * - Configures which endpoints are public
 * - Enables token-based authentication for the rest
 */
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    /**
     * Password encoder used for hashing and verifying user passwords.
     * BCrypt is a secure hashing algorithm recommended for production use.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Defines the main security filter chain.
     * - Disables CSRF (since we’re using stateless REST APIs)
     * - Allows user creation (`POST /api/users`) without authentication
     * - Uses OAuth2 Resource Server (JWT) to validate Keycloak tokens for protected
     * endpoints
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF protection for REST APIs
                .csrf(csrf -> csrf.disable())

                // Define which requests are public and which require authentication
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/users").permitAll() // allow creating users (registration)
                        .requestMatchers("/api/users/internal/**").permitAll()  // Allow internal service-to-service calls
                        .anyRequest().authenticated()  // all other requests require a valid token
                )

                // Configure OAuth2 Resource Server to validate incoming Keycloak JWTs
                .oauth2ResourceServer(
                        oauth2 -> oauth2.jwt(org.springframework.security.config.Customizer.withDefaults()));

        // Build and return the configured security filter chain
        return http.build();
    }
}
