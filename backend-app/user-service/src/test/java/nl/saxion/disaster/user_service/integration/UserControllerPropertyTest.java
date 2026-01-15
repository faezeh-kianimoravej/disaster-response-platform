package nl.saxion.disaster.user_service.integration;


import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import net.jqwik.api.Arbitraries;
import net.jqwik.api.Arbitrary;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.repository.contract.ResponderProfileRepository;
import nl.saxion.disaster.user_service.repository.contract.UserRepository;
import nl.saxion.disaster.user_service.service.KeycloakAdminClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.*;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@Tag("property")
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.cloud.discovery.enabled=false",
                "spring.cloud.config.enabled=false",
                "spring.autoconfigure.exclude=" +
                        "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration," +
                        "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration," +
                        "org.springframework.boot.autoconfigure.data.jpa.JpaRepositoriesAutoConfiguration," +
                        "org.springframework.boot.autoconfigure.jdbc.DataSourceTransactionManagerAutoConfiguration"
        }
)
@ActiveProfiles("test")
class UserControllerPropertyTest {

    @LocalServerPort
    int port;

    @MockBean UserRepository userRepository;
    @MockBean ResponderProfileRepository responderProfileRepository;
    @MockBean KeycloakAdminClient keycloakAdminClient;
    @MockBean JwtDecoder jwtDecoder;

    private static final List<String> VALID_ROLES =
            List.of("CITIZEN", "MAYOR", "REGION_ADMIN");

    @BeforeEach
    void setup() {
        RestAssured.port = port;
        RestAssured.basePath = "/api/users";

        when(userRepository.createUser(any(User.class))).thenReturn(new User());
        when(responderProfileRepository.findByUserId(anyLong())).thenReturn(Optional.empty());
        Mockito.doNothing().when(responderProfileRepository).deleteByUserId(anyLong());

        when(keycloakAdminClient.createUserInKeycloak(anyString(), anyString(), anyString(), anyString()))
                .thenReturn("kc-1");
        when(keycloakAdminClient.assignRolesToUser(anyString(), anySet()))
                .thenReturn(true);
    }

    @Test
    void createUser_neverReturns5xx_forManyRandomInputs() {
        Arbitrary<String> firstName = Arbitraries.strings().alpha().ofMinLength(1).ofMaxLength(30);
        Arbitrary<String> lastName  = Arbitraries.strings().alpha().ofMinLength(1).ofMaxLength(30);

        Arbitrary<String> email = Arbitraries.strings()
                .withChars("abcdefghijklmnopqrstuvwxyz")
                .ofMinLength(3).ofMaxLength(12)
                .map(s -> s.toLowerCase() + "@example.com");

        Arbitrary<String> mobile = Arbitraries.strings().numeric().ofMinLength(8).ofMaxLength(12);

        Arbitrary<String> password = Arbitraries.strings()
                .withChars("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=")
                .ofMinLength(6).ofMaxLength(20);

        Arbitrary<String> role = Arbitraries.of(VALID_ROLES);

        int N = 150;

        for (int i = 0; i < N; i++) {
            String fn = firstName.sample();
            String ln = lastName.sample();
            String em = email.sample();
            String mo = mobile.sample();
            String pw = password.sample();
            String r  = role.sample();

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("firstName", fn);
            payload.put("lastName", ln);
            payload.put("email", em);
            payload.put("mobile", mo);
            payload.put("password", pw);
            payload.put("roles", List.of(Map.of("roleType", r)));
            payload.put("responderProfile", null);

            given()
                    .contentType(ContentType.JSON)
                    .body(payload)
                    .when()
                    .post("")
                    .then()
                    .statusCode(not(greaterThanOrEqualTo(500)));
        }
    }
}
