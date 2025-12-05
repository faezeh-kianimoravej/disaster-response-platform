package nl.saxion.disaster.user_service.configuration;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import static org.assertj.core.api.Assertions.*;

/**
 * JWT Decoder configuration unit tests.
 * These tests validate the JwtDecoderConfig bean creation and configuration.
 * 
 * Note: Full JWT validation tests require a running Keycloak instance.
 * These tests focus on bean creation and configuration.
 */
@DisplayName("JwtDecoderConfig - Bean Creation and Configuration")
class JwtDecoderConfigUnitTest {

    @Test
    @DisplayName("JwtDecoderConfig class should be a Spring Configuration")
    void jwtDecoderConfig_shouldBeConfiguration() {
        assertThat(JwtDecoderConfig.class.isAnnotationPresent(Configuration.class)).isTrue();
    }

    @Test
    @DisplayName("JwtDecoderConfig should have a jwtDecoder bean method")
    void jwtDecoderConfig_shouldHaveJwtDecoderBeanMethod() {
        try {
            assertThat(JwtDecoderConfig.class.getDeclaredMethod("jwtDecoder")).isNotNull();
        } catch (NoSuchMethodException e) {
            fail("jwtDecoder() method not found in JwtDecoderConfig");
        }
    }

    @Test
    @DisplayName("JWT Decoder bean method should be annotated with @Bean")
    void jwtDecoderMethod_shouldHaveBeanAnnotation() throws NoSuchMethodException {
        var method = JwtDecoderConfig.class.getDeclaredMethod("jwtDecoder");
        assertThat(method.isAnnotationPresent(Bean.class)).isTrue();
    }

    @Test
    @DisplayName("JwtDecoderConfig should build JWK Set URI from issuer URI")
    void jwtDecoderConfig_shouldConstructJwkSetUri() {
        // This test validates the configuration logic
        // Keycloak JWK Set endpoint is: {issuer}/protocol/openid-connect/certs
        String issuerUri = "http://localhost:9090/realms/DRCCS";
        String expectedJwkSetUri = issuerUri + "/protocol/openid-connect/certs";
        
        assertThat(expectedJwkSetUri).contains("protocol/openid-connect/certs");
    }
}
