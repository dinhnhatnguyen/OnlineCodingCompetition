package oj.onlineCodingCompetition.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.postgresql.util.PGobject;

import java.sql.SQLException;

@Converter
public class JsonbConverter implements AttributeConverter<String, Object> {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Object convertToDatabaseColumn(String attribute) {
        try {
            if (attribute == null) {
                return null;
            }

            // Create PostgreSQL-specific object
            PGobject pgObject = new PGobject();
            pgObject.setType("jsonb");
            pgObject.setValue(attribute);
            return pgObject;
        } catch (SQLException e) {
            throw new RuntimeException("Error converting to JSONB", e);
        }
    }

    @Override
    public String convertToEntityAttribute(Object dbData) {
        try {
            if (dbData == null) {
                return null;
            }

            if (dbData instanceof PGobject) {
                return ((PGobject) dbData).getValue();
            } else {
                return objectMapper.writeValueAsString(dbData);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error converting from JSONB", e);
        }
    }
}