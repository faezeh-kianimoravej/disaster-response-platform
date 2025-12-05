package nl.saxion.disaster.user_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;

@Service
public class KeycloakAdminClient {
    private static final Logger log = LoggerFactory.getLogger(KeycloakAdminClient.class);
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
    private static final Duration USER_LOOKUP_RETRY_DELAY = Duration.ofMillis(200);
    private static final int USER_LOOKUP_MAX_ATTEMPTS = 6;

    private final RestTemplate rest;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${keycloak.url}")
    private String keycloakUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.admin.username}")
    private String adminUser;

    @Value("${keycloak.admin.password}")
    private String adminPass;

    // prefer constructor injection for easier testing
    public KeycloakAdminClient(RestTemplate rest) {
        this.rest = rest != null ? rest : new RestTemplate();
    }

    // Simple guard and logging, returns created Keycloak user id or null
    public String createUserInKeycloak(String firstName, String lastName, String email, String password) {
        log.info("Creating Keycloak user: first='{}', last='{}', email='{}'", firstName, lastName, email);

        if (!isValidEmail(email)) {
            log.warn("Invalid email provided, skipping Keycloak: {}", email);
            return null;
        }

        String token = obtainAdminAccessToken();
        if (token == null) {
            log.error("Cannot obtain Keycloak admin token");
            return null;
        }

        HttpHeaders headers = commonHeaders(token);
        String userJson = buildUserJson(firstName, lastName, email);

        ResponseEntity<Void> createResp;
        try {
            createResp = rest.exchange(keycloakUrl + "/admin/realms/" + realm + "/users",
                    HttpMethod.POST, new HttpEntity<>(userJson, headers), Void.class);
            log.info("Keycloak create response: {}", createResp.getStatusCode());
        } catch (HttpStatusCodeException ex) {
            log.error("Keycloak create user error: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            return null;
        }

        // try Location header first (fast)
        String userId = extractUserIdFromLocation(createResp.getHeaders().getLocation());
        if (userId != null) {
            log.debug("UserId obtained from Location header: {}", userId);
        } else {
            // fallback: search by email with retries (creation may be eventually consistent)
            userId = findUserIdByEmailWithRetry(email, headers);
        }

        if (userId == null) {
            log.error("Failed to locate created user in Keycloak for email: {}", email);
            return null;
        }

        // set password (best-effort)
        if (!setUserPassword(userId, password, headers)) {
            log.warn("Setting password failed for userId={}", userId);
        }

        return userId;
    }

    public boolean assignRolesToUser(String userId, Iterable<String> roleNames) {
        if (userId == null || userId.isBlank()) {
            log.warn("assignRolesToUser called with empty userId");
            return false;
        }
        if (roleNames == null) {
            log.debug("No roles provided to assign for userId={}", userId);
            return true;
        }

        String token = obtainAdminAccessToken();
        if (token == null) {
            log.error("Cannot obtain Keycloak admin token for role assignment");
            return false;
        }

        HttpHeaders headers = commonHeaders(token);

        // First, remove all default roles
        removeDefaultRoles(userId, headers);

        // Then assign custom roles
        ArrayNode rolesArray = mapper.createArrayNode();
        Set<String> seen = new HashSet<>();

        for (String roleName : roleNames) {
            if (roleName == null || roleName.isBlank() || !seen.add(roleName)) continue;
            JsonNode role = fetchRoleRepresentation(roleName, headers);
            if (role != null) {
                ObjectNode r = mapper.createObjectNode();
                if (role.has("id")) r.put("id", role.get("id").asText());
                if (role.has("name")) r.put("name", role.get("name").asText());
                if (role.has("containerId")) r.put("containerId", role.get("containerId").asText(""));
                rolesArray.add(r);
                log.debug("Prepared role for assignment: {}", roleName);
            } else {
                log.warn("Role not found in Keycloak: {}", roleName);
            }
        }

        if (rolesArray.isEmpty()) {
            log.info("No valid roles to assign for userId={}", userId);
            return true;
        }

        try {
            rest.exchange(keycloakUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm",
                    HttpMethod.POST, new HttpEntity<>(mapper.writeValueAsString(rolesArray), headers), Void.class);
            log.info("Assigned {} role(s) to userId={}", rolesArray.size(), userId);
            return true;
        } catch (HttpStatusCodeException ex) {
            log.error("Failed to assign roles: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            return false;
        } catch (Exception ex) {
            log.error("Unexpected error while assigning roles: {}", ex.getMessage());
            return false;
        }
    }

    private void removeDefaultRoles(String userId, HttpHeaders headers) {
        String[] defaultRoles = {"offline_access", "default-roles-drccs", "uma_authorization"};
        
        for (String roleName : defaultRoles) {
            try {
                JsonNode role = fetchRoleRepresentation(roleName, headers);
                if (role != null) {
                    ArrayNode roleToRemove = mapper.createArrayNode();
                    ObjectNode r = mapper.createObjectNode();
                    if (role.has("id")) r.put("id", role.get("id").asText());
                    if (role.has("name")) r.put("name", role.get("name").asText());
                    if (role.has("containerId")) r.put("containerId", role.get("containerId").asText(""));
                    roleToRemove.add(r);

                    rest.exchange(
                            keycloakUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm",
                            HttpMethod.DELETE,
                            new HttpEntity<>(mapper.writeValueAsString(roleToRemove), headers),
                            Void.class);
                    log.debug("Removed default role '{}' from userId={}", roleName, userId);
                }
            } catch (Exception ex) {
                log.debug("Could not remove default role '{}': {}", roleName, ex.getMessage());
            }
        }
    }

    // ---------------- helpers ----------------

    private HttpHeaders commonHeaders(String bearerToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(bearerToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }

    private String buildUserJson(String firstName, String lastName, String email) {
        ObjectNode node = mapper.createObjectNode()
                .put("username", email)
                .put("email", email)
                .put("enabled", true)
                .put("emailVerified", true)
                .put("firstName", firstName == null ? "" : firstName)
                .put("lastName", lastName == null ? "" : lastName);
        return node.toString();
    }

    private String extractUserIdFromLocation(java.net.URI location) {
        if (location == null) return null;
        String path = location.getPath();
        if (path == null || path.isBlank()) return null;
        String[] parts = path.split("/");
        return parts.length == 0 ? null : parts[parts.length - 1];
    }

    private String findUserIdByEmailWithRetry(String email, HttpHeaders headers) {
        int attempts = 0;
        while (attempts < USER_LOOKUP_MAX_ATTEMPTS) {
            attempts++;
            try {
                String encoded = URLEncoder.encode(email, StandardCharsets.UTF_8);
                ResponseEntity<String> resp = rest.exchange(
                        keycloakUrl + "/admin/realms/" + realm + "/users?email=" + encoded,
                        HttpMethod.GET, new HttpEntity<>(headers), String.class);
                JsonNode users = mapper.readTree(resp.getBody());
                if (users.isArray() && users.size() > 0) {
                    return users.get(0).get("id").asText();
                }
            } catch (Exception ex) {
                log.debug("Attempt {} user lookup failed: {}", attempts, ex.getMessage());
            }
            try { Thread.sleep(USER_LOOKUP_RETRY_DELAY.toMillis()); } catch (InterruptedException ignored) { Thread.currentThread().interrupt(); break; }
        }
        return null;
    }

    private JsonNode fetchRoleRepresentation(String roleName, HttpHeaders headers) {
        try {
            String encoded = URLEncoder.encode(roleName, StandardCharsets.UTF_8);
            ResponseEntity<String> resp = rest.exchange(
                    keycloakUrl + "/admin/realms/" + realm + "/roles/" + encoded,
                    HttpMethod.GET, new HttpEntity<>(headers), String.class);
            if (!resp.getStatusCode().is2xxSuccessful()) return null;
            return mapper.readTree(resp.getBody());
        } catch (HttpStatusCodeException ex) {
            log.debug("Role fetch failed for {}: {}", roleName, ex.getResponseBodyAsString());
            return null;
        } catch (Exception ex) {
            log.debug("Unexpected error fetching role {}: {}", roleName, ex.getMessage());
            return null;
        }
    }

    private boolean setUserPassword(String userId, String password, HttpHeaders headers) {
        try {
            ObjectNode pwd = mapper.createObjectNode()
                    .put("type", "password")
                    .put("temporary", false)
                    .put("value", password);
            rest.exchange(keycloakUrl + "/admin/realms/" + realm + "/users/" + userId + "/reset-password",
                    HttpMethod.PUT, new HttpEntity<>(pwd.toString(), headers), Void.class);
            log.debug("Password set for userId={}", userId);
            return true;
        } catch (HttpStatusCodeException ex) {
            log.error("setUserPassword status {} : {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            return false;
        } catch (Exception ex) {
            log.error("setUserPassword unexpected error: {}", ex.getMessage());
            return false;
        }
    }

    private String obtainAdminAccessToken() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("grant_type", "password");
            form.add("client_id", "admin-cli");
            form.add("username", adminUser);
            form.add("password", adminPass);

            ResponseEntity<String> tokenResp = rest.postForEntity(
                    keycloakUrl + "/realms/master/protocol/openid-connect/token",
                    new HttpEntity<>(form, headers), String.class);
            if (!tokenResp.getStatusCode().is2xxSuccessful()) {
                log.error("Token endpoint returned status {}", tokenResp.getStatusCode());
                return null;
            }
            JsonNode node = mapper.readTree(tokenResp.getBody());
            return node.path("access_token").asText(null);
        } catch (Exception ex) {
            log.error("Failed to obtain admin token: {}", ex.getMessage());
            return null;
        }
    }

    private static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }
}
