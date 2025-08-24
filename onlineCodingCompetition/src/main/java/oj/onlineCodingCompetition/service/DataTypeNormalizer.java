package oj.onlineCodingCompetition.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Universal Data Type Normalizer for Cross-Language Compatibility
 * Bộ chuẩn hóa kiểu dữ liệu đa ngôn ngữ
 */
@Service
@Slf4j
public class DataTypeNormalizer {

    // Universal data types
    public enum UniversalType {
        INTEGER("integer"),
        FLOAT("float"),
        BOOLEAN("boolean"),
        STRING("string"),
        CHARACTER("character"),
        INTEGER_ARRAY("integer_array"),
        FLOAT_ARRAY("float_array"),
        BOOLEAN_ARRAY("boolean_array"),
        STRING_ARRAY("string_array"),
        INTEGER_LIST("integer_list"),
        FLOAT_LIST("float_list"),
        STRING_LIST("string_list"),
        STRING_MAP("string_map"),
        INTEGER_MAP("integer_map"),
        OBJECT("object");

        private final String value;

        UniversalType(String value) {
            this.value = value;
        }

        public String getValue() {
            return value;
        }
    }

    // Language-specific type mappings
    private static final Map<String, Map<String, UniversalType>> LANGUAGE_TO_UNIVERSAL = createLanguageToUniversalMapping();


    // Universal to language-specific mappings
    private static final Map<String, Map<UniversalType, String>> UNIVERSAL_TO_LANGUAGE = createUniversalToLanguageMapping();

    /**
     * Create language to universal type mapping
     */
    private static Map<String, Map<String, UniversalType>> createLanguageToUniversalMapping() {
        Map<String, Map<String, UniversalType>> mapping = new HashMap<>();

        // Java mappings
        Map<String, UniversalType> javaMap = new HashMap<>();
        javaMap.put("int", UniversalType.INTEGER);
        javaMap.put("Integer", UniversalType.INTEGER);
        javaMap.put("long", UniversalType.INTEGER);
        javaMap.put("Long", UniversalType.INTEGER);
        javaMap.put("double", UniversalType.FLOAT);
        javaMap.put("Double", UniversalType.FLOAT);
        javaMap.put("float", UniversalType.FLOAT);
        javaMap.put("Float", UniversalType.FLOAT);
        javaMap.put("boolean", UniversalType.BOOLEAN);
        javaMap.put("Boolean", UniversalType.BOOLEAN);
        javaMap.put("String", UniversalType.STRING);
        javaMap.put("char", UniversalType.CHARACTER);
        javaMap.put("Character", UniversalType.CHARACTER);
        javaMap.put("int[]", UniversalType.INTEGER_ARRAY);
        javaMap.put("Integer[]", UniversalType.INTEGER_ARRAY);
        javaMap.put("double[]", UniversalType.FLOAT_ARRAY);
        javaMap.put("Double[]", UniversalType.FLOAT_ARRAY);
        javaMap.put("boolean[]", UniversalType.BOOLEAN_ARRAY);
        javaMap.put("Boolean[]", UniversalType.BOOLEAN_ARRAY);
        javaMap.put("String[]", UniversalType.STRING_ARRAY);
        javaMap.put("List<Integer>", UniversalType.INTEGER_LIST);
        javaMap.put("List<Double>", UniversalType.FLOAT_LIST);
        javaMap.put("List<String>", UniversalType.STRING_LIST);
        javaMap.put("ArrayList<Integer>", UniversalType.INTEGER_LIST);
        javaMap.put("Map<String,Integer>", UniversalType.STRING_MAP);
        javaMap.put("HashMap<String,Integer>", UniversalType.STRING_MAP);
        mapping.put("java", javaMap);

        // Python mappings
        Map<String, UniversalType> pythonMap = new HashMap<>();
        pythonMap.put("int", UniversalType.INTEGER);
        pythonMap.put("float", UniversalType.FLOAT);
        pythonMap.put("bool", UniversalType.BOOLEAN);
        pythonMap.put("str", UniversalType.STRING);
        pythonMap.put("List[int]", UniversalType.INTEGER_LIST);
        pythonMap.put("list[int]", UniversalType.INTEGER_LIST);
        pythonMap.put("List[float]", UniversalType.FLOAT_LIST);
        pythonMap.put("list[float]", UniversalType.FLOAT_LIST);
        pythonMap.put("List[bool]", UniversalType.BOOLEAN_ARRAY);
        pythonMap.put("List[str]", UniversalType.STRING_LIST);
        pythonMap.put("list[str]", UniversalType.STRING_LIST);
        pythonMap.put("Dict[str,int]", UniversalType.STRING_MAP);
        pythonMap.put("dict[str,int]", UniversalType.STRING_MAP);
        pythonMap.put("Dict[str,str]", UniversalType.STRING_MAP);
        mapping.put("python", pythonMap);

        // C++ mappings
        Map<String, UniversalType> cppMap = new HashMap<>();
        cppMap.put("int", UniversalType.INTEGER);
        cppMap.put("long", UniversalType.INTEGER);
        cppMap.put("short", UniversalType.INTEGER);
        cppMap.put("float", UniversalType.FLOAT);
        cppMap.put("double", UniversalType.FLOAT);
        cppMap.put("bool", UniversalType.BOOLEAN);
        cppMap.put("char", UniversalType.CHARACTER);
        cppMap.put("string", UniversalType.STRING);
        cppMap.put("vector<int>", UniversalType.INTEGER_LIST);
        cppMap.put("vector<double>", UniversalType.FLOAT_LIST);
        cppMap.put("vector<bool>", UniversalType.BOOLEAN_ARRAY);
        cppMap.put("vector<string>", UniversalType.STRING_LIST);
        cppMap.put("int[]", UniversalType.INTEGER_ARRAY);
        cppMap.put("double[]", UniversalType.FLOAT_ARRAY);
        cppMap.put("map<string,int>", UniversalType.STRING_MAP);
        cppMap.put("map<string,string>", UniversalType.STRING_MAP);
        mapping.put("cpp", cppMap);

        // JavaScript mappings
        Map<String, UniversalType> jsMap = new HashMap<>();
        jsMap.put("number", UniversalType.FLOAT); // JavaScript numbers are floats
        jsMap.put("string", UniversalType.STRING);
        jsMap.put("boolean", UniversalType.BOOLEAN);
        jsMap.put("number[]", UniversalType.FLOAT_ARRAY);
        jsMap.put("string[]", UniversalType.STRING_ARRAY);
        jsMap.put("boolean[]", UniversalType.BOOLEAN_ARRAY);
        jsMap.put("Array<number>", UniversalType.FLOAT_LIST);
        jsMap.put("Array<string>", UniversalType.STRING_LIST);
        jsMap.put("Array<boolean>", UniversalType.BOOLEAN_ARRAY);
        jsMap.put("object", UniversalType.OBJECT);
        jsMap.put("Map", UniversalType.STRING_MAP);
        mapping.put("javascript", jsMap);

        return mapping;
    }

    /**
     * Create universal to language type mapping
     */
    private static Map<String, Map<UniversalType, String>> createUniversalToLanguageMapping() {
        Map<String, Map<UniversalType, String>> mapping = new HashMap<>();

        // Java mappings
        Map<UniversalType, String> javaMap = new HashMap<>();
        javaMap.put(UniversalType.INTEGER, "int");
        javaMap.put(UniversalType.FLOAT, "double");
        javaMap.put(UniversalType.BOOLEAN, "boolean");
        javaMap.put(UniversalType.STRING, "String");
        javaMap.put(UniversalType.CHARACTER, "char");
        javaMap.put(UniversalType.INTEGER_ARRAY, "int[]");
        javaMap.put(UniversalType.FLOAT_ARRAY, "double[]");
        javaMap.put(UniversalType.BOOLEAN_ARRAY, "boolean[]");
        javaMap.put(UniversalType.STRING_ARRAY, "String[]");
        javaMap.put(UniversalType.INTEGER_LIST, "List<Integer>");
        javaMap.put(UniversalType.FLOAT_LIST, "List<Double>");
        javaMap.put(UniversalType.STRING_LIST, "List<String>");
        javaMap.put(UniversalType.STRING_MAP, "Map<String,Integer>");
        mapping.put("java", javaMap);

        // Python mappings
        Map<UniversalType, String> pythonMap = new HashMap<>();
        pythonMap.put(UniversalType.INTEGER, "int");
        pythonMap.put(UniversalType.FLOAT, "float");
        pythonMap.put(UniversalType.BOOLEAN, "bool");
        pythonMap.put(UniversalType.STRING, "str");
        pythonMap.put(UniversalType.INTEGER_ARRAY, "List[int]");
        pythonMap.put(UniversalType.FLOAT_ARRAY, "List[float]");
        pythonMap.put(UniversalType.BOOLEAN_ARRAY, "List[bool]");
        pythonMap.put(UniversalType.STRING_ARRAY, "List[str]");
        pythonMap.put(UniversalType.INTEGER_LIST, "List[int]");
        pythonMap.put(UniversalType.FLOAT_LIST, "List[float]");
        pythonMap.put(UniversalType.STRING_LIST, "List[str]");
        pythonMap.put(UniversalType.STRING_MAP, "Dict[str,int]");
        mapping.put("python", pythonMap);

        // C++ mappings
        Map<UniversalType, String> cppMap = new HashMap<>();
        cppMap.put(UniversalType.INTEGER, "int");
        cppMap.put(UniversalType.FLOAT, "double");
        cppMap.put(UniversalType.BOOLEAN, "bool");
        cppMap.put(UniversalType.STRING, "string");
        cppMap.put(UniversalType.CHARACTER, "char");
        cppMap.put(UniversalType.INTEGER_ARRAY, "vector<int>");
        cppMap.put(UniversalType.FLOAT_ARRAY, "vector<double>");
        cppMap.put(UniversalType.BOOLEAN_ARRAY, "vector<bool>");
        cppMap.put(UniversalType.STRING_ARRAY, "vector<string>");
        cppMap.put(UniversalType.INTEGER_LIST, "vector<int>");
        cppMap.put(UniversalType.FLOAT_LIST, "vector<double>");
        cppMap.put(UniversalType.STRING_LIST, "vector<string>");
        cppMap.put(UniversalType.STRING_MAP, "map<string,int>");
        mapping.put("cpp", cppMap);

        // JavaScript mappings
        Map<UniversalType, String> jsMap = new HashMap<>();
        jsMap.put(UniversalType.INTEGER, "number");
        jsMap.put(UniversalType.FLOAT, "number");
        jsMap.put(UniversalType.BOOLEAN, "boolean");
        jsMap.put(UniversalType.STRING, "string");
        jsMap.put(UniversalType.CHARACTER, "string");
        jsMap.put(UniversalType.INTEGER_ARRAY, "number[]");
        jsMap.put(UniversalType.FLOAT_ARRAY, "number[]");
        jsMap.put(UniversalType.BOOLEAN_ARRAY, "boolean[]");
        jsMap.put(UniversalType.STRING_ARRAY, "string[]");
        jsMap.put(UniversalType.INTEGER_LIST, "Array<number>");
        jsMap.put(UniversalType.FLOAT_LIST, "Array<number>");
        jsMap.put(UniversalType.STRING_LIST, "Array<string>");
        jsMap.put(UniversalType.STRING_MAP, "object");
        mapping.put("javascript", jsMap);

        return mapping;
    }

    /**
     * Convert language-specific type to universal type
     */
    public UniversalType toUniversalType(String languageType, String language) {
        Map<String, UniversalType> languageMapping = LANGUAGE_TO_UNIVERSAL.get(language.toLowerCase());
        if (languageMapping == null) {
            log.warn("Unsupported language: {}", language);
            return UniversalType.OBJECT;
        }
        
        UniversalType universalType = languageMapping.get(languageType);
        if (universalType == null) {
            log.warn("Unknown type '{}' for language '{}'", languageType, language);
            return UniversalType.OBJECT;
        }
        
        return universalType;
    }

    /**
     * Convert universal type to language-specific type
     */
    public String toLanguageType(UniversalType universalType, String language) {
        Map<UniversalType, String> languageMapping = UNIVERSAL_TO_LANGUAGE.get(language.toLowerCase());
        if (languageMapping == null) {
            log.warn("Unsupported language: {}", language);
            return "object";
        }
        
        String languageType = languageMapping.get(universalType);
        if (languageType == null) {
            log.warn("No mapping for universal type '{}' to language '{}'", universalType, language);
            return "object";
        }
        
        return languageType;
    }

    /**
     * Normalize test case data types for cross-language compatibility
     */
    public String normalizeDataType(String originalType, String fromLanguage, String toLanguage) {
        UniversalType universalType = toUniversalType(originalType, fromLanguage);
        return toLanguageType(universalType, toLanguage);
    }

    /**
     * Detect universal type from value
     */
    public UniversalType detectUniversalType(Object value) {
        if (value == null) return UniversalType.OBJECT;
        
        if (value instanceof Integer || value instanceof Long) {
            return UniversalType.INTEGER;
        } else if (value instanceof Float || value instanceof Double) {
            return UniversalType.FLOAT;
        } else if (value instanceof Boolean) {
            return UniversalType.BOOLEAN;
        } else if (value instanceof String) {
            return UniversalType.STRING;
        } else if (value instanceof List) {
            List<?> list = (List<?>) value;
            if (list.isEmpty()) return UniversalType.INTEGER_LIST;
            
            Object first = list.get(0);
            if (first instanceof Integer || first instanceof Long) {
                return UniversalType.INTEGER_LIST;
            } else if (first instanceof Float || first instanceof Double) {
                return UniversalType.FLOAT_LIST;
            } else if (first instanceof String) {
                return UniversalType.STRING_LIST;
            } else if (first instanceof Boolean) {
                return UniversalType.BOOLEAN_ARRAY;
            }
        }
        
        return UniversalType.OBJECT;
    }

    /**
     * Get supported languages
     */
    public Set<String> getSupportedLanguages() {
        return LANGUAGE_TO_UNIVERSAL.keySet();
    }

    /**
     * Check if language is supported
     */
    public boolean isLanguageSupported(String language) {
        return LANGUAGE_TO_UNIVERSAL.containsKey(language.toLowerCase());
    }
}
