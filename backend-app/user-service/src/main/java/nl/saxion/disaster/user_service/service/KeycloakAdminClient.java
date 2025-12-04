package nl.saxion.disaster.user_service.service;

// ...place in your service module (e.g. src/main/java/.../keycloak/KeycloakAdminClient.java)
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import java.util.regex.Pattern;

@Service
public class KeycloakAdminClient {
    private final RestTemplate rest;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${keycloak.url:http://keycloak:9090}")
    private String keycloakUrl;

    @Value("${keycloak.realm:DRCCS}")
    private String realm;

    @Value("${keycloak.admin.username:disaster-admin}")
    private String adminUser;

    @Value("${keycloak.admin.password:AdminSecure123!}")
    private String adminPass;

    public KeycloakAdminClient() {
        this.rest = new RestTemplate();
    }

    /**
     * Create a Keycloak user with firstName, lastName, email and password.
     * Returns the userId on success, null on failure.
     */
    public String createUserInKeycloak(String firstName,
                                       String lastName,
                                       String email,
                                       String password) throws Exception {

        System.out.printf("Keycloak create user request: firstName='%s', lastName='%s', email='%s'%n",
            firstName, lastName, email);

        // basic email validation
        if (email == null || !isValidEmail(email)) {
            System.err.printf("Skipping Keycloak call: invalid email '%s'%n", email);
            return null;
        }

        String token = obtainAdminAccessToken();
        if (token == null) return null;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        ObjectNode userNode = mapper.createObjectNode()
            .put("username", email)
            .put("email", email)
            .put("enabled", true)
            .put("emailVerified", true)
            .put("firstName", firstName == null ? "" : firstName)
            .put("lastName", lastName == null ? "" : lastName);

        String userJson = userNode.toString();

        try {
            HttpEntity<String> createReq = new HttpEntity<>(userJson, headers);
            rest.exchange(
                keycloakUrl + "/admin/realms/" + realm + "/users",
                HttpMethod.POST, createReq, Void.class);
        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            System.err.printf("Keycloak create user failed: %s : %s%n", ex.getStatusCode(), ex.getResponseBodyAsString());
            return null;
        }

        // find user id by email
        HttpEntity<Void> getReq = new HttpEntity<>(headers);
        ResponseEntity<String> listResp = rest.exchange(
            keycloakUrl + "/admin/realms/" + realm + "/users?email=" + URLEncoder.encode(email, StandardCharsets.UTF_8),
            HttpMethod.GET, getReq, String.class);

        JsonNode users = mapper.readTree(listResp.getBody());
        if (!users.isArray() || users.size() == 0) return null;
        String userId = users.get(0).get("id").asText();

        // set password
        try {
            String pwdJson = mapper.createObjectNode()
                .put("type", "password")
                .put("temporary", false)
                .put("value", password)
                .toString();
            HttpEntity<String> pwdReq = new HttpEntity<>(pwdJson, headers);
            rest.exchange(
                keycloakUrl + "/admin/realms/" + realm + "/users/" + userId + "/reset-password",
                HttpMethod.PUT, pwdReq, Void.class);
            System.out.printf("User created successfully in Keycloak with userId='%s'%n", userId);
        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            System.err.printf("Keycloak reset-password failed: %s : %s%n", ex.getStatusCode(), ex.getResponseBodyAsString());
        }

        return userId;
    }

    /**
     * Assign realm roles to an existing Keycloak user.
     * @param userId the Keycloak user ID (returned from createUserInKeycloak)
     * @param roleNames collection of role names to assign
     * @return true if assignment succeeds or no roles provided, false on error
     */
    public boolean assignRolesToUser(String userId, Iterable<String> roleNames) throws Exception {

        if (userId == null || userId.isBlank()) {
            System.err.println("Cannot assign roles: userId is null or blank");
            return false;
        }

        if (roleNames == null) {
            System.out.println("No roles to assign");
            return true;
        }

        String token = obtainAdminAccessToken();
        if (token == null) return false;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Void> getReq = new HttpEntity<>(headers);
        ArrayNode rolesArray = mapper.createArrayNode();
        Set<String> processed = new HashSet<>();

        for (String roleName : roleNames) {
            if (roleName == null || roleName.isBlank() || processed.contains(roleName)) continue;
            processed.add(roleName);

            try {
                System.out.printf("Fetching role '%s'%n", roleName);
                ResponseEntity<String> roleResp = rest.exchange(
                    keycloakUrl + "/admin/realms/" + realm + "/roles/" + URLEncoder.encode(roleName, StandardCharsets.UTF_8),
                    HttpMethod.GET, getReq, String.class);

                if (!roleResp.getStatusCode().is2xxSuccessful()) {
                    System.err.printf("Role '%s' not found or inaccessible%n", roleName);
                    continue;
                }

                JsonNode roleObj = mapper.readTree(roleResp.getBody());
                ObjectNode r = mapper.createObjectNode();
                if (roleObj.has("id")) r.put("id", roleObj.get("id").asText());
                if (roleObj.has("name")) r.put("name", roleObj.get("name").asText());
                if (roleObj.has("containerId")) r.put("containerId", roleObj.get("containerId").asText(""));
                rolesArray.add(r);
                System.out.printf("Added role '%s' to assignment list%n", roleName);
            } catch (org.springframework.web.client.HttpStatusCodeException ex) {
                System.err.printf("Role '%s' fetch failed: %s%n", roleName, ex.getResponseBodyAsString());
            }
        }

        if (rolesArray.size() == 0) {
            System.out.println("No valid roles to assign");
            return true;
        }

        try {
            System.out.printf("Assigning %d role(s) to userId='%s'%n", rolesArray.size(), userId);
            HttpEntity<String> assignReq = new HttpEntity<>(mapper.writeValueAsString(rolesArray), headers);
            rest.exchange(
                keycloakUrl + "/admin/realms/" + realm + "/users/" + userId + "/role-mappings/realm",
                HttpMethod.POST, assignReq, Void.class);
            System.out.printf("Roles assigned successfully to userId='%s'%n", userId);
            return true;
        } catch (org.springframework.web.client.HttpStatusCodeException ex) {
            System.err.printf("Assigning roles failed: %s : %s%n", ex.getStatusCode(), ex.getResponseBodyAsString());
            return false;
        }
    }

    private String obtainAdminAccessToken() throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "password");
        form.add("client_id", "admin-cli");
        form.add("username", adminUser);
        form.add("password", adminPass);

        HttpEntity<MultiValueMap<String, String>> tokenReq = new HttpEntity<>(form, headers);
        ResponseEntity<String> tokenResp = rest.postForEntity(
            keycloakUrl + "/realms/master/protocol/openid-connect/token",
            tokenReq, String.class);

        if (!tokenResp.getStatusCode().is2xxSuccessful()) return null;
        JsonNode node = mapper.readTree(tokenResp.getBody());
        return node.path("access_token").asText(null);
    }

    private static boolean isValidEmail(String email) {
        final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");
        return EMAIL.matcher(email).matches();
    }
}
