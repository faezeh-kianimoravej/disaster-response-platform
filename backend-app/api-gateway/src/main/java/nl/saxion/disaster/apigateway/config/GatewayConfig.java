package nl.saxion.disaster.apigateway.config;

import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.http.HttpHeaders;

import java.util.Arrays;
import java.util.List;

/**
 * CORS configuration for the API Gateway.
 * This allows the frontend (running on localhost:3000 or other origins)
 * to make requests to the backend services through the gateway.
 */
@Configuration
public class GatewayConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration corsConfig = new CorsConfiguration();
        
        // Allow specific origins (development and production)
        corsConfig.setAllowedOriginPatterns(Arrays.asList("*"));
        
        // Allow all HTTP methods
        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Allow all headers
        corsConfig.setAllowedHeaders(List.of("*"));
        
        // Allow credentials (cookies, authorization headers, etc.)
        corsConfig.setAllowCredentials(true);
        
        // How long preflight response can be cached
        corsConfig.setMaxAge(3600L);
        
        // Expose headers to the client
        corsConfig.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);
        
        return new CorsWebFilter(source);
    }

    @Bean
    public GlobalFilter addAuthHeaderFilter() {
        return (exchange, chain) -> {
            ServerWebExchange mutatedExchange = exchange.mutate()
                    .request(exchange.getRequest().mutate()
                            .header(HttpHeaders.AUTHORIZATION,
                                    exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION))
                            .build())
                    .build();
            return chain.filter(mutatedExchange);
        };
    }
}
