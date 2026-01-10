package nl.saxion.disaster.deploymentservice.configuration;

import feign.RequestInterceptor;
import feign.Response;
import feign.codec.ErrorDecoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignClientConfig {

    @Bean
    public ErrorDecoder errorDecoder() {
        return new FeignCustomErrorDecoder();
    }

    // Propagate inbound bearer token to downstream Feign calls so chat-service receives Authorization.
    @Bean
    public RequestInterceptor bearerTokenRequestInterceptor() {
        return template -> {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) {
                return; // no web request context (e.g., async/background)
            }

            String authHeader = attrs.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && !authHeader.isBlank()) {
                template.header(HttpHeaders.AUTHORIZATION, authHeader);
            }
        };
    }

    public static class FeignCustomErrorDecoder implements ErrorDecoder {

        private final ErrorDecoder defaultDecoder = new Default();

        @Override
        public Exception decode(String methodKey, Response response) {

            int status = response.status();

            return switch (status) {
                case 400 -> new IllegalArgumentException("Bad Request from resource-service");
                case 404 -> new IllegalStateException("Resource not found (404)");
                case 409 -> new IllegalStateException("Conflict: resource cannot be allocated");
                case 500 -> new RuntimeException("Internal error inside resource-service");
                default -> defaultDecoder.decode(methodKey, response);
            };
        }
    }
}
