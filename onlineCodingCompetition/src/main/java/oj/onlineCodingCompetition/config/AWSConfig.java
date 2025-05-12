package oj.onlineCodingCompetition.config;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.AmazonSQSClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AWSConfig {

    @Value("${cloud.aws.credentials.access-key:}")
    private String accessKey;

    @Value("${cloud.aws.credentials.secret-key:}")
    private String secretKey;

    @Value("${cloud.aws.region:ap-southeast-2}")
    private String region;

    @Bean
    public AmazonSQS amazonSQS() {
        // Nếu có access key và secret key
        if (!accessKey.isEmpty() && !secretKey.isEmpty()) {
            BasicAWSCredentials awsCredentials = new BasicAWSCredentials(accessKey, secretKey);
            return AmazonSQSClientBuilder.standard()
                    .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
                    .withRegion(Regions.fromName(region))
                    .build();
        }

        // Sử dụng cấu hình mặc định (từ AWS CLI hoặc EC2 Instance Profile)
        return AmazonSQSClientBuilder.standard()
                .withRegion(Regions.fromName(region))
                .build();
    }
}