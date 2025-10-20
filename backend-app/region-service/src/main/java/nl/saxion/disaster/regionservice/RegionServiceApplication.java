package nl.saxion.disaster.regionservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = "nl.saxion.disaster.regionservice")
@EnableFeignClients(basePackages = "nl.saxion.disaster.regionservice.client")
@EnableDiscoveryClient
public class RegionServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(RegionServiceApplication.class, args);
    }

}
