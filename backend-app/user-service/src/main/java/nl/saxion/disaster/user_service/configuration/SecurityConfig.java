package nl.saxion.disaster.user_service.configuration;

import lombok.RequiredArgsConstructor;
import nl.saxion.disaster.user_service.security.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

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

    // Custom JWT filter that validates tokens for incoming requests
    private final JwtFilter jwtFilter;

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
     * - Allows /api/users/login and /api/users/register without authentication
     * - Protects all other endpoints with JWT authentication
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF protection for REST APIs
                .csrf(csrf -> csrf.disable())

                // Define which requests are public and which require authentication
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/users/login", "/api/users/register").permitAll()  // public endpoints
                        .anyRequest().authenticated()  // all other requests require a valid token
                )

                // Add our custom JWT filter before the UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        // Build and return the configured security filter chain
        return http.build();
    }
}
