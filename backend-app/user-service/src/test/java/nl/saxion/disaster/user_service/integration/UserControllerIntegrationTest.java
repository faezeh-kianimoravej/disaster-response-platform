package nl.saxion.disaster.user_service.integration;


import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import net.jqwik.api.Arbitraries;
import net.jqwik.api.Arbitrary;
import nl.saxion.disaster.user_service.model.entity.User;
import nl.saxion.disaster.user_service.model.enums.RoleType;
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

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.notNullValue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@Tag("integration")
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
class UserControllerIntegrationTest {

    @LocalServerPort
    private int port;

    @MockBean UserRepository userRepository;
    @MockBean ResponderProfileRepository responderProfileRepository;
    @MockBean KeycloakAdminClient keycloakAdminClient;

    @MockBean JwtDecoder jwtDecoder;

    @BeforeEach
    void setUp() throws Exception {
        RestAssured.port = port;
        RestAssured.basePath = "/api/users";

        when(userRepository.createUser(any(User.class)))
                .thenAnswer(inv -> {
                    User u = inv.getArgument(0, User.class);
                    if (u.getId() == null) u.setId(1L);
                    return u;
                });

        when(userRepository.findAllActiveUsers()).thenReturn(List.of());
        when(userRepository.findUserById(anyLong())).thenReturn(Optional.empty());
        when(userRepository.findUserByEmail(anyString())).thenReturn(Optional.empty());

        when(responderProfileRepository.findByUserId(anyLong())).thenReturn(Optional.empty());
        Mockito.doNothing().when(responderProfileRepository).deleteByUserId(anyLong());

        when(keycloakAdminClient.createUserInKeycloak(anyString(), anyString(), anyString(), anyString()))
                .thenReturn("kc-1");
        when(keycloakAdminClient.assignRolesToUser(anyString(), anySet()))
                .thenReturn(true);
    }

    @Test
    void createUser_withRandomValidishData_shouldReturn201Or400_not500() {

        Arbitrary<String> firstNames = alphaName(1, 30);
        Arbitrary<String> lastNames  = alphaName(1, 30);

        Arbitrary<String> emails = Arbitraries.strings()
                .withChars("abcdefghijklmnopqrstuvwxyz")
                .ofMinLength(3).ofMaxLength(12)
                .map(s -> s.toLowerCase() + "@example.com");

        Arbitrary<String> mobiles = Arbitraries.strings()
                .numeric()
                .ofMinLength(8).ofMaxLength(12);

        Arbitrary<String> passwords = Arbitraries.strings()
                .withChars("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=")
                .ofMinLength(6).ofMaxLength(20);

        Arbitrary<RoleType> roleTypes = Arbitraries.of(RoleType.values());

        firstNames.flatMap(fn ->
                lastNames.flatMap(ln ->
                        emails.flatMap(em ->
                                mobiles.flatMap(mo ->
                                        passwords.flatMap(pw ->
                                                roleTypes.map(rt -> new Object[]{fn, ln, em, mo, pw, rt})
                                        )
                                )
                        )
                )
        ).sampleStream().limit(20).forEach(params -> {

            String fn = (String) params[0];
            String ln = (String) params[1];
            String em = (String) params[2];
            String mo = (String) params[3];
            String pw = (String) params[4];
            RoleType rt = (RoleType) params[5];

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("firstName", fn);
            payload.put("lastName", ln);
            payload.put("email", em);
            payload.put("mobile", mo);
            payload.put("password", pw);
            payload.put("roles", List.of(Map.of("roleType", roleJsonValue(rt))));
            payload.put("responderProfile", null);

            given()
                    .contentType(ContentType.JSON)
                    .body(payload)
                    .when()
                    .post("")
                    .then()
                    .statusCode(anyOf(equalTo(201), equalTo(400)))
                    .body(notNullValue());
        });
    }


    @Test
    void getUser_byId_withoutToken_shouldReturn401() {
        Arbitraries.integers().between(1, 1000).sampleStream().limit(20).forEach(id -> {
            given()
                    .when()
                    .get("/{id}", id)
                    .then()
                    .statusCode(401);
        });
    }


    @Test
    void getAllActiveUsers_withoutToken_shouldReturn401() {
        given()
                .when()
                .get("/active")
                .then()
                .statusCode(401);
    }

    // ---------------- helpers ----------------

    private Arbitrary<String> alphaName(int min, int max) {
        return Arbitraries.strings()
                .withChars("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
                .ofMinLength(min).ofMaxLength(max);
    }


    private String roleJsonValue(RoleType rt) {
        if (rt == null) return null;
        try {
            var m = rt.getClass().getMethod("getValue");
            Object v = m.invoke(rt);
            return String.valueOf(v);
        } catch (Exception ignored) {
            return rt.name();
        }
    }
}
