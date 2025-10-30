package nl.saxion.disaster.resourceservice.config;


import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;

@Configuration
@ConditionalOnProperty(name = "spring.sql.init.mode", havingValue = "always")
public class DatabaseInitConfig {

    @Autowired
    private DataSource dataSource;

    @PostConstruct
    public void init() {
        try {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator(
                    new ClassPathResource("data.sql")
            );
            populator.execute(dataSource);
            System.out.println("Data.sql executed after schema creation.");
        } catch (Exception e) {
            System.err.println("⚠️ Failed to run data.sql: " + e.getMessage());
        }
    }
}