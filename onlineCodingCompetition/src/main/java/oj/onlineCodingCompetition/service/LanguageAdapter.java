package oj.onlineCodingCompetition.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import oj.onlineCodingCompetition.service.DataTypeNormalizer.UniversalType;

import java.util.*;

/**
 * Language-Specific Adapters for Cross-Language Test Case Execution
 * Bộ chuyển đổi đặc thù ngôn ngữ cho việc thực thi test case đa ngôn ngữ
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LanguageAdapter {

    private final DataTypeNormalizer dataTypeNormalizer;
    private final ObjectMapper objectMapper;

    // Inner classes for JSON parsing
    public static class TestCaseInput {
        private String input;
        private String dataType;

        public TestCaseInput() {}

        public String getInput() { return input; }
        public void setInput(String input) { this.input = input; }
        public String getDataType() { return dataType; }
        public void setDataType(String dataType) { this.dataType = dataType; }
    }

    public static class TestCaseOutput {
        private String expectedOutput;
        private String dataType;

        public TestCaseOutput() {}

        public String getExpectedOutput() { return expectedOutput; }
        public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
        public String getDataType() { return dataType; }
        public void setDataType(String dataType) { this.dataType = dataType; }
    }

    /**
     * Convert test case input data for specific language execution
     */
    public String convertInputForLanguage(String inputDataJson, String language) {
        try {
            List<TestCaseInput> inputs =
                objectMapper.readValue(inputDataJson, objectMapper.getTypeFactory()
                    .constructCollectionType(List.class, TestCaseInput.class));
            
            return switch (language.toLowerCase()) {
                case "java" -> convertInputForJava(inputs);
                case "python" -> convertInputForPython(inputs);
                case "cpp" -> convertInputForCpp(inputs);
                case "javascript" -> convertInputForJavaScript(inputs);
                default -> throw new UnsupportedOperationException("Language not supported: " + language);
            };
            
        } catch (Exception e) {
            log.error("Error converting input for language {}: {}", language, e.getMessage());
            throw new RuntimeException("Failed to convert input data", e);
        }
    }

    /**
     * Convert expected output for specific language
     */
    public String convertOutputForLanguage(String expectedOutputJson, String language) {
        try {
            TestCaseOutput output =
                objectMapper.readValue(expectedOutputJson, TestCaseOutput.class);
            
            return switch (language.toLowerCase()) {
                case "java" -> convertOutputForJava(output);
                case "python" -> convertOutputForPython(output);
                case "cpp" -> convertOutputForCpp(output);
                case "javascript" -> convertOutputForJavaScript(output);
                default -> throw new UnsupportedOperationException("Language not supported: " + language);
            };
            
        } catch (Exception e) {
            log.error("Error converting output for language {}: {}", language, e.getMessage());
            throw new RuntimeException("Failed to convert output data", e);
        }
    }

    // Java-specific conversions
    private String convertInputForJava(List<TestCaseInput> inputs) {
        StringBuilder javaInput = new StringBuilder();
        
        for (TestCaseInput input : inputs) {
            String value = input.getInput();
            String dataType = input.getDataType();
            
            UniversalType universalType = dataTypeNormalizer.toUniversalType(dataType, "java");
            String convertedValue = convertValueForJava(value, universalType);
            
            javaInput.append(convertedValue).append("\n");
        }
        
        return javaInput.toString().trim();
    }

    private String convertValueForJava(String value, UniversalType type) {
        return switch (type) {
            case INTEGER -> value;
            case FLOAT -> value;
            case BOOLEAN -> value;
            case STRING -> "\"" + value.replace("\"", "") + "\"";
            case INTEGER_ARRAY, INTEGER_LIST -> convertArrayForJava(value, "int");
            case FLOAT_ARRAY, FLOAT_LIST -> convertArrayForJava(value, "double");
            case STRING_ARRAY, STRING_LIST -> convertArrayForJava(value, "String");
            case BOOLEAN_ARRAY -> convertArrayForJava(value, "boolean");
            default -> value;
        };
    }

    private String convertArrayForJava(String arrayValue, String elementType) {
        try {
            // Remove brackets and split by comma
            String cleaned = arrayValue.replace("[", "").replace("]", "").trim();
            if (cleaned.isEmpty()) return "{}";
            
            String[] elements = cleaned.split(",");
            StringBuilder result = new StringBuilder("{");
            
            for (int i = 0; i < elements.length; i++) {
                String element = elements[i].trim();
                if ("String".equals(elementType)) {
                    result.append("\"").append(element.replace("\"", "")).append("\"");
                } else {
                    result.append(element);
                }
                if (i < elements.length - 1) result.append(", ");
            }
            
            result.append("}");
            return result.toString();
        } catch (Exception e) {
            log.warn("Error converting array for Java: {}", e.getMessage());
            return "{}";
        }
    }

    // Python-specific conversions
    private String convertInputForPython(List<TestCaseInput> inputs) {
        StringBuilder pythonInput = new StringBuilder();
        
        for (TestCaseInput input : inputs) {
            String value = input.getInput();
            String dataType = input.getDataType();

            UniversalType universalType = dataTypeNormalizer.toUniversalType(dataType, "python");
            String convertedValue = convertValueForPython(value, universalType);

            pythonInput.append(convertedValue).append("\n");
        }
        
        return pythonInput.toString().trim();
    }

    private String convertValueForPython(String value, UniversalType type) {
        return switch (type) {
            case INTEGER -> value;
            case FLOAT -> value;
            case BOOLEAN -> value.toLowerCase(); // true/false -> True/False
            case STRING -> "'" + value.replace("'", "\\'") + "'";
            case INTEGER_LIST, INTEGER_ARRAY -> value; // Python uses same format
            case FLOAT_LIST, FLOAT_ARRAY -> value;
            case STRING_LIST, STRING_ARRAY -> convertStringArrayForPython(value);
            case BOOLEAN_ARRAY -> value.replace("true", "True").replace("false", "False");
            default -> value;
        };
    }

    private String convertStringArrayForPython(String arrayValue) {
        try {
            // Convert ["item1", "item2"] to ['item1', 'item2']
            return arrayValue.replace("\"", "'");
        } catch (Exception e) {
            log.warn("Error converting string array for Python: {}", e.getMessage());
            return "[]";
        }
    }

    // C++ specific conversions
    private String convertInputForCpp(List<TestCaseInput> inputs) {
        StringBuilder cppInput = new StringBuilder();

        for (TestCaseInput input : inputs) {
            String value = input.getInput();
            String dataType = input.getDataType();
            
            UniversalType universalType = dataTypeNormalizer.toUniversalType(dataType, "cpp");
            String convertedValue = convertValueForCpp(value, universalType);
            
            cppInput.append(convertedValue).append("\n");
        }
        
        return cppInput.toString().trim();
    }

    private String convertValueForCpp(String value, UniversalType type) {
        return switch (type) {
            case INTEGER -> value;
            case FLOAT -> value;
            case BOOLEAN -> value.equals("true") ? "1" : "0"; // C++ bool as 1/0
            case STRING -> value.replace("\"", ""); // Remove quotes for C++ string input
            case INTEGER_LIST, INTEGER_ARRAY -> convertArrayForCpp(value);
            case FLOAT_LIST, FLOAT_ARRAY -> convertArrayForCpp(value);
            case STRING_LIST, STRING_ARRAY -> convertStringArrayForCpp(value);
            default -> value;
        };
    }

    private String convertArrayForCpp(String arrayValue) {
        try {
            // Convert [1,2,3] to space-separated: 3 1 2 3 (size first)
            String cleaned = arrayValue.replace("[", "").replace("]", "").trim();
            if (cleaned.isEmpty()) return "0";
            
            String[] elements = cleaned.split(",");
            StringBuilder result = new StringBuilder();
            result.append(elements.length).append(" "); // Size first
            
            for (String element : elements) {
                result.append(element.trim()).append(" ");
            }
            
            return result.toString().trim();
        } catch (Exception e) {
            log.warn("Error converting array for C++: {}", e.getMessage());
            return "0";
        }
    }

    private String convertStringArrayForCpp(String arrayValue) {
        try {
            String cleaned = arrayValue.replace("[", "").replace("]", "").trim();
            if (cleaned.isEmpty()) return "0";
            
            String[] elements = cleaned.split(",");
            StringBuilder result = new StringBuilder();
            result.append(elements.length).append("\n");
            
            for (String element : elements) {
                result.append(element.trim().replace("\"", "")).append("\n");
            }
            
            return result.toString().trim();
        } catch (Exception e) {
            log.warn("Error converting string array for C++: {}", e.getMessage());
            return "0";
        }
    }

    // JavaScript specific conversions
    private String convertInputForJavaScript(List<TestCaseInput> inputs) {
        StringBuilder jsInput = new StringBuilder();

        for (TestCaseInput input : inputs) {
            String value = input.getInput();
            String dataType = input.getDataType();
            
            UniversalType universalType = dataTypeNormalizer.toUniversalType(dataType, "javascript");
            String convertedValue = convertValueForJavaScript(value, universalType);
            
            jsInput.append(convertedValue).append("\n");
        }
        
        return jsInput.toString().trim();
    }

    private String convertValueForJavaScript(String value, UniversalType type) {
        return switch (type) {
            case INTEGER, FLOAT -> value;
            case BOOLEAN -> value.toLowerCase();
            case STRING -> "\"" + value.replace("\"", "") + "\"";
            case INTEGER_LIST, INTEGER_ARRAY, FLOAT_LIST, FLOAT_ARRAY -> value; // Same format
            case STRING_LIST, STRING_ARRAY -> value; // Same format
            case BOOLEAN_ARRAY -> value.replace("True", "true").replace("False", "false");
            default -> value;
        };
    }

    // Output conversion methods
    private String convertOutputForJava(TestCaseOutput output) {
        return output.getExpectedOutput(); // Java output is usually straightforward
    }

    private String convertOutputForPython(TestCaseOutput output) {
        String value = output.getExpectedOutput();
        String dataType = output.getDataType();
        
        UniversalType universalType = dataTypeNormalizer.toUniversalType(dataType, "python");
        
        return switch (universalType) {
            case BOOLEAN -> value.replace("true", "True").replace("false", "False");
            default -> value;
        };
    }

    private String convertOutputForCpp(TestCaseOutput output) {
        String value = output.getExpectedOutput();
        String dataType = output.getDataType();
        
        UniversalType universalType = dataTypeNormalizer.toUniversalType(dataType, "cpp");
        
        return switch (universalType) {
            case BOOLEAN -> value.equals("true") ? "1" : "0";
            default -> value;
        };
    }

    private String convertOutputForJavaScript(TestCaseOutput output) {
        return output.getExpectedOutput(); // JavaScript output is usually straightforward
    }

    /**
     * Get language-specific data type for universal type
     */
    public String getLanguageSpecificType(UniversalType universalType, String language) {
        return dataTypeNormalizer.toLanguageType(universalType, language);
    }

    /**
     * Check if conversion is needed between languages
     */
    public boolean needsConversion(String fromLanguage, String toLanguage) {
        return !fromLanguage.equalsIgnoreCase(toLanguage);
    }
}
