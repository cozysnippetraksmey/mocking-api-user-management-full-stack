package com.cozysnippet.simple_mocking_api;

import com.cozysnippet.simple_mocking_api.config.AppConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppConfig.class)
public class SimpleMockingApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(SimpleMockingApiApplication.class, args);
	}

}
