package oj.onlineCodingCompetition;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@OpenAPIDefinition(info = @Info(title = "Online Coding Competition API", version = "1.0"))
@EnableScheduling
public class OnlineCodingCompetitionApplication {

	public static void main(String[] args) {SpringApplication.run(OnlineCodingCompetitionApplication.class, args);
	}

}
