package oj.onlineCodingCompetition.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import oj.onlineCodingCompetition.security.entity.User;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        // Cấu hình ModelMapper để khớp chính xác các trường
        modelMapper.getConfiguration()
                .setMatchingStrategy(MatchingStrategies.STRICT)
                .setFieldMatchingEnabled(true)
                .setFieldAccessLevel(org.modelmapper.config.Configuration.AccessLevel.PRIVATE);

        // Thêm converter cho User -> Long
        modelMapper.createTypeMap(User.class, Long.class)
                .setConverter(context -> {
                    User source = context.getSource();
                    return source == null ? null : source.getId();
                });

        return modelMapper;
    }
}