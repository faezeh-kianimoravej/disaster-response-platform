package nl.saxion.disaster.incident_service.config;



import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI incidentOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Incident Service API")
                        .version("1.0")
                        .description("API for managing incident records")
                        .contact(new Contact().name("Ops Team").email("ops@example.com")));
    }
}

