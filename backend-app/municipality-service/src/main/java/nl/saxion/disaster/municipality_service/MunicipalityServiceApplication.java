package nl.saxion.disaster.municipality_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "nl.saxion.disaster.municipality_service.client")
@EnableDiscoveryClient
public class MunicipalityServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MunicipalityServiceApplication.class, args);
    }

}
