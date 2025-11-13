package nl.saxion.disaster.deploymentservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication(scanBasePackages = "nl.saxion.disaster.deploymentservice")
@EnableFeignClients(basePackages = "nl.saxion.disaster.deploymentservice.client")
@EnableDiscoveryClient
public class DeploymentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(DeploymentServiceApplication.class, args);
    }

}
