package nl.saxion.disaster.user_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import nl.saxion.disaster.user_service.model.entity.User;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    // Secret key used to sign and verify the JWT.
    // ⚠️ Must be at least 32 characters long for HMAC-SHA algorithms.
    private final String secretKey = "thisIsASecretKeyForJwtTokenDemo1234567890";

    // Token expiration time (in milliseconds) — here it's 1 hour.
    private final long expirationMs = 3600000;

    /**
     * Generates a JWT token for the given user.
     * The token includes:
     * - 'sub' (subject): the user's email (unique identifier)
     * - 'roles': list of role names from the user's Role enum types
     * - 'iat': issued-at timestamp
     * - 'exp': expiration timestamp
     *
     * @param user The authenticated user entity
     * @return A signed JWT token string
     */
    public String generateToken(User user) {

        // Convert the user's roles (enum values) to a list of strings
        List<String> roles = user.getRoles()
                .stream()
                .map(role -> role.getRoleType().name()) // e.g. RoleType.ADMIN → "ADMIN"
                .collect(Collectors.toList());

        // Build and sign the token
        return Jwts.builder()
                .setSubject(user.getEmail())               // unique identifier of the token owner
                .claim("roles", roles)                     // attach user roles as a claim
                .setIssuedAt(new Date())                   // when the token was created
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs)) // when it will expire
                .signWith(Keys.hmacShaKeyFor(secretKey.getBytes()), SignatureAlgorithm.HS256) // sign with the secret key
                .compact();                                // compact the JWT into a string
    }

    /**
     * Validates a JWT token and returns its claims (decoded payload).
     * If the token is invalid, expired, or tampered with, this method will throw an exception.
     *
     * @param token The JWT string to validate
     * @return Claims extracted from the token
     */
    public Claims validateToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey.getBytes())  // use the same key that was used for signing
                .build()
                .parseClaimsJws(token)                // parse and verify the token
                .getBody();                           // extract the claims (payload)
    }
}
