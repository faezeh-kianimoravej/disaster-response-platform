package nl.saxion.disaster.notification_service.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Provides a JwtDecoder bean for validating Keycloak-issued tokens and allows
 * multiple trusted issuers (useful for local-dev vs docker hostnames).
 */
@Configuration
public class JwtDecoderConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Value("${spring.security.oauth2.resourceserver.jwt.allowed-issuers:}")
    private String allowedIssuersCsv;

    @Bean
    public JwtDecoder jwtDecoder() {
        String jwkSetUri = issuerUri;
        if (!issuerUri.endsWith("/")) {
            jwkSetUri = issuerUri + "/";
        }
        jwkSetUri = jwkSetUri + "protocol/openid-connect/certs";

        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri).build();

        OAuth2TokenValidator<Jwt> withTimestamp = new JwtTimestampValidator();

        Set<String> allowedIssuers = Arrays.stream((issuerUri == null ? "" : issuerUri).split("\n"))
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .collect(Collectors.toSet());
        if (allowedIssuersCsv != null && !allowedIssuersCsv.isBlank()) {
            Set<String> extra = Arrays.stream(allowedIssuersCsv.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toSet());
            allowedIssuers.addAll(extra);
        }

        OAuth2TokenValidator<Jwt> issuerValidator = jwt -> {
            String iss = jwt.getIssuer() != null ? jwt.getIssuer().toString() : null;
            if (iss != null && allowedIssuers.contains(iss)) {
                return OAuth2TokenValidatorResult.success();
            }
            OAuth2Error err = new OAuth2Error("invalid_token", "The iss claim is not a trusted issuer", null);
            return OAuth2TokenValidatorResult.failure(err);
        };

        OAuth2TokenValidator<Jwt> validator = new DelegatingOAuth2TokenValidator<>(issuerValidator, withTimestamp);
        jwtDecoder.setJwtValidator(validator);

        return jwtDecoder;
    }
}
