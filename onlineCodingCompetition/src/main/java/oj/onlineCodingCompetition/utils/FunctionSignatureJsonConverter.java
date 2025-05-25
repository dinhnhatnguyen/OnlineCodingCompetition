package oj.onlineCodingCompetition.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import oj.onlineCodingCompetition.entity.Problem;

public class FunctionSignatureJsonConverter implements AttributeConverter<Problem.FunctionSignature, String> {
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Problem.FunctionSignature attribute) {
        if (attribute == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Error converting FunctionSignature to JSON", e);
        }
    }

    @Override
    public Problem.FunctionSignature convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }

        try {

            if (dbData.startsWith("FunctionSignature")) {
                return new Problem.FunctionSignature();
            }
            return objectMapper.readValue(dbData, Problem.FunctionSignature.class);
        } catch (JsonProcessingException e) {
            System.err.println("Failed to parse JSON: " + dbData);
            return new Problem.FunctionSignature();
        }
    }
}