package nl.saxion.disaster.apigateway;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.net.URI;

@RestController
public class ProxyController {

    private final WebClient client;

    public ProxyController(WebClient.Builder builder) {
        this.client = builder.build();
    }

    // Map gateway service segment to target base URL, including internal base paths
    private String routeTo(String service) {
        return switch (service) {
            case "departments" -> "lb://department-service/api/department";
            case "resources" -> "lb://resource-service/api/resources";
            case "municipalities" -> "lb://municipality-service";
            default -> throw new IllegalArgumentException("Unknown service: " + service);
        };
    }

    @RequestMapping("/api/{service}/**")
    public Mono<ResponseEntity<byte[]>> proxy(@PathVariable String service,
                                              ServerHttpRequest request,
                                              @RequestBody(required = false) Mono<byte[]> body) {
        String base = routeTo(service);

        // Compute the downstream URI: base + remaining path after /api/{service}
        String requestUri = request.getURI().getRawPath(); // e.g., /api/departments/123
        String prefix = "/api/" + service;
        String remainder = requestUri.startsWith(prefix) ? requestUri.substring(prefix.length()) : "";
        if (!StringUtils.hasText(remainder)) {
            remainder = "/"; // default root
        }

        String query = request.getURI().getRawQuery();
        String target = base + remainder + (query != null && !query.isEmpty() ? ("?" + query) : "");
    final String fRemainder = remainder;
    final String fQuery = query;
    final String fBase = base;

    HttpMethod method = request.getMethod() != null ? request.getMethod() : HttpMethod.GET;
    WebClient.RequestBodySpec spec = client.method(method)
                .uri(URI.create(target))
                .headers(httpHeaders -> httpHeaders.addAll(request.getHeaders()));

    Mono<ClientResponse> responseMono = (body != null && requiresBody(method.name()))
                ? body.defaultIfEmpty(new byte[0]).flatMap(b -> spec.bodyValue(b).exchangeToMono(Mono::just))
                : spec.exchangeToMono(Mono::just);

        // Fallback: if discovery has no instances (lb://), retry using static host mapping
    return responseMono
                .flatMap(resp -> resp.toEntity(byte[].class))
                .onErrorResume(ex -> {
            String staticBase = staticBase(service);
            if (staticBase == null || !fBase.startsWith("lb://")) return Mono.error(ex);
            String retryTarget = staticBase + fRemainder + (fQuery != null && !fQuery.isEmpty() ? ("?" + fQuery) : "");
            WebClient.RequestBodySpec retry = client.method(method)
                            .uri(URI.create(retryTarget))
                            .headers(httpHeaders -> httpHeaders.addAll(request.getHeaders()));
            Mono<ClientResponse> retryResp = (body != null && requiresBody(method.name()))
                            ? body.defaultIfEmpty(new byte[0]).flatMap(b -> retry.bodyValue(b).exchangeToMono(Mono::just))
                            : retry.exchangeToMono(Mono::just);
                    return retryResp.flatMap(r -> r.toEntity(byte[].class));
                });
    }


    private static boolean requiresBody(String method) {
        return switch (method.toUpperCase()) {
            case "POST", "PUT", "PATCH" -> true;
            default -> false;
        };
    }

    private String staticBase(String service) {
        return switch (service) {
            case "departments" -> "http://department-service:8081/api/department";
            case "resources" -> "http://resource-service:8084/api/resources";
            case "municipalities" -> "http://municipality-service:8082";
            default -> null;
        };
    }
}
