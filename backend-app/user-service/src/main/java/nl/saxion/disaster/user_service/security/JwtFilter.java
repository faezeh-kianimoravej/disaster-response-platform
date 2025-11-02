package nl.saxion.disaster.user_service.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JwtFilter is a custom security filter that executes once per request.
 * It intercepts every incoming HTTP request, checks if an Authorization header exists,
 * extracts the JWT token (if present), and validates it using JwtUtil.
 * <p>
 * If the token is invalid or expired, the request is blocked with HTTP 401 (Unauthorized).
 * Otherwise, the request continues to the next filter in the chain.
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    // JwtUtil is injected by Spring for token validation
    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * This method runs once per incoming request and performs JWT validation.
     *
     * @param request  The incoming HTTP request
     * @param response The HTTP response that will be sent back to the client
     * @param chain    The remaining filter chain to execute if authentication passes
     * @throws ServletException if the filter fails due to a servlet issue
     * @throws IOException      if the filter fails due to an I/O issue
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // Retrieve the Authorization header (expected format: "Bearer <token>")
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7); // remove "Bearer " prefix

            try {
                // Validate the token (signature, expiration, etc.) and extract claims
                Claims claims = jwtUtil.validateToken(token);

                // Extract user details from token claims
                String email = claims.getSubject();
                @SuppressWarnings("unchecked")
                List<String> roleNames = claims.get("roles", List.class);

                // Convert role names to Spring Security authorities
                Collection<? extends GrantedAuthority> authorities = 
                    roleNames != null ? 
                        roleNames.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList()) 
                        : List.of();

                // Create authentication token and set it in SecurityContext
                // This is what Spring Security checks with .authenticated()
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(email, null, authorities);
                
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (Exception e) {
                // Token is invalid or expired → block request
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }

        // Continue processing the request if no issues
        chain.doFilter(request, response);
    }
}
