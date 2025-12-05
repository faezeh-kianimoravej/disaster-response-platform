package nl.saxion.disaster.notification_service.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {
    private final JwtDecoder jwtDecoder;

    @Autowired
    public JwtTokenService(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    /**
     * Decodes and validates a JWT token using Spring Security's JwtDecoder.
     * Throws JwtException if invalid or expired.
     */
    public Jwt decodeAndValidate(String token) throws JwtException {
        return jwtDecoder.decode(token);
    }

    /**
     * Example: Extract Keycloak subject (user id) from JWT.
     */
    public String getSubject(String token) {
        Jwt jwt = decodeAndValidate(token);
        return jwt.getSubject();
    }
}
