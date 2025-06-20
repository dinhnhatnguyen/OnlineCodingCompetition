/**
 * Cross-Language Data Type Utilities
 * Tiện ích kiểu dữ liệu đa ngôn ngữ
 */

// Universal data types
export const UNIVERSAL_TYPES = {
  INTEGER: "integer",
  FLOAT: "float",
  BOOLEAN: "boolean", 
  STRING: "string",
  CHARACTER: "character",
  INTEGER_ARRAY: "integer_array",
  FLOAT_ARRAY: "float_array",
  BOOLEAN_ARRAY: "boolean_array",
  STRING_ARRAY: "string_array",
  INTEGER_LIST: "integer_list",
  FLOAT_LIST: "float_list",
  STRING_LIST: "string_list",
  STRING_MAP: "string_map",
  INTEGER_MAP: "integer_map",
  OBJECT: "object"
};

// Language-specific type mappings
export const LANGUAGE_TYPE_MAPPING = {
  java: {
    [UNIVERSAL_TYPES.INTEGER]: ["int", "Integer", "long", "Long"],
    [UNIVERSAL_TYPES.FLOAT]: ["double", "Double", "float", "Float"],
    [UNIVERSAL_TYPES.BOOLEAN]: ["boolean", "Boolean"],
    [UNIVERSAL_TYPES.STRING]: ["String"],
    [UNIVERSAL_TYPES.CHARACTER]: ["char", "Character"],
    [UNIVERSAL_TYPES.INTEGER_ARRAY]: ["int[]", "Integer[]"],
    [UNIVERSAL_TYPES.FLOAT_ARRAY]: ["double[]", "Double[]"],
    [UNIVERSAL_TYPES.BOOLEAN_ARRAY]: ["boolean[]", "Boolean[]"],
    [UNIVERSAL_TYPES.STRING_ARRAY]: ["String[]"],
    [UNIVERSAL_TYPES.INTEGER_LIST]: ["List<Integer>", "ArrayList<Integer>"],
    [UNIVERSAL_TYPES.FLOAT_LIST]: ["List<Double>", "ArrayList<Double>"],
    [UNIVERSAL_TYPES.STRING_LIST]: ["List<String>", "ArrayList<String>"],
    [UNIVERSAL_TYPES.STRING_MAP]: ["Map<String,Integer>", "HashMap<String,Integer>"]
  },
  
  python: {
    [UNIVERSAL_TYPES.INTEGER]: ["int"],
    [UNIVERSAL_TYPES.FLOAT]: ["float"],
    [UNIVERSAL_TYPES.BOOLEAN]: ["bool"],
    [UNIVERSAL_TYPES.STRING]: ["str"],
    [UNIVERSAL_TYPES.INTEGER_ARRAY]: ["List[int]", "list[int]"],
    [UNIVERSAL_TYPES.FLOAT_ARRAY]: ["List[float]", "list[float]"],
    [UNIVERSAL_TYPES.BOOLEAN_ARRAY]: ["List[bool]", "list[bool]"],
    [UNIVERSAL_TYPES.STRING_ARRAY]: ["List[str]", "list[str]"],
    [UNIVERSAL_TYPES.INTEGER_LIST]: ["List[int]"],
    [UNIVERSAL_TYPES.FLOAT_LIST]: ["List[float]"],
    [UNIVERSAL_TYPES.STRING_LIST]: ["List[str]"],
    [UNIVERSAL_TYPES.STRING_MAP]: ["Dict[str,int]", "dict[str,int]"]
  },
  
  cpp: {
    [UNIVERSAL_TYPES.INTEGER]: ["int", "long", "short"],
    [UNIVERSAL_TYPES.FLOAT]: ["double", "float"],
    [UNIVERSAL_TYPES.BOOLEAN]: ["bool"],
    [UNIVERSAL_TYPES.STRING]: ["string"],
    [UNIVERSAL_TYPES.CHARACTER]: ["char"],
    [UNIVERSAL_TYPES.INTEGER_ARRAY]: ["int[]"],
    [UNIVERSAL_TYPES.FLOAT_ARRAY]: ["double[]"],
    [UNIVERSAL_TYPES.BOOLEAN_ARRAY]: ["bool[]"],
    [UNIVERSAL_TYPES.STRING_ARRAY]: ["string[]"],
    [UNIVERSAL_TYPES.INTEGER_LIST]: ["vector<int>"],
    [UNIVERSAL_TYPES.FLOAT_LIST]: ["vector<double>"],
    [UNIVERSAL_TYPES.STRING_LIST]: ["vector<string>"],
    [UNIVERSAL_TYPES.STRING_MAP]: ["map<string,int>"]
  },
  
  javascript: {
    [UNIVERSAL_TYPES.INTEGER]: ["number"],
    [UNIVERSAL_TYPES.FLOAT]: ["number"],
    [UNIVERSAL_TYPES.BOOLEAN]: ["boolean"],
    [UNIVERSAL_TYPES.STRING]: ["string"],
    [UNIVERSAL_TYPES.CHARACTER]: ["string"],
    [UNIVERSAL_TYPES.INTEGER_ARRAY]: ["number[]"],
    [UNIVERSAL_TYPES.FLOAT_ARRAY]: ["number[]"],
    [UNIVERSAL_TYPES.BOOLEAN_ARRAY]: ["boolean[]"],
    [UNIVERSAL_TYPES.STRING_ARRAY]: ["string[]"],
    [UNIVERSAL_TYPES.INTEGER_LIST]: ["Array<number>"],
    [UNIVERSAL_TYPES.FLOAT_LIST]: ["Array<number>"],
    [UNIVERSAL_TYPES.STRING_LIST]: ["Array<string>"],
    [UNIVERSAL_TYPES.STRING_MAP]: ["object", "Map"]
  }
};

// Reverse mapping: language-specific type to universal type
const createReverseMapping = () => {
  const reverseMapping = {};
  
  Object.keys(LANGUAGE_TYPE_MAPPING).forEach(language => {
    reverseMapping[language] = {};
    Object.entries(LANGUAGE_TYPE_MAPPING[language]).forEach(([universalType, languageTypes]) => {
      languageTypes.forEach(langType => {
        reverseMapping[language][langType] = universalType;
      });
    });
  });
  
  return reverseMapping;
};

const REVERSE_MAPPING = createReverseMapping();

/**
 * Convert language-specific type to universal type
 */
export const toUniversalType = (languageType, language) => {
  const languageMapping = REVERSE_MAPPING[language?.toLowerCase()];
  if (!languageMapping) {
    console.warn(`Unsupported language: ${language}`);
    return UNIVERSAL_TYPES.OBJECT;
  }
  
  const universalType = languageMapping[languageType];
  if (!universalType) {
    console.warn(`Unknown type '${languageType}' for language '${language}'`);
    return UNIVERSAL_TYPES.OBJECT;
  }
  
  return universalType;
};

/**
 * Convert universal type to language-specific type (preferred type)
 */
export const toLanguageType = (universalType, language) => {
  const languageMapping = LANGUAGE_TYPE_MAPPING[language?.toLowerCase()];
  if (!languageMapping) {
    console.warn(`Unsupported language: ${language}`);
    return "object";
  }
  
  const languageTypes = languageMapping[universalType];
  if (!languageTypes || languageTypes.length === 0) {
    console.warn(`No mapping for universal type '${universalType}' to language '${language}'`);
    return "object";
  }
  
  // Return the first (preferred) type
  return languageTypes[0];
};

/**
 * Normalize data type across languages
 */
export const normalizeDataType = (originalType, fromLanguage, toLanguage) => {
  const universalType = toUniversalType(originalType, fromLanguage);
  return toLanguageType(universalType, toLanguage);
};

/**
 * Detect universal type from JavaScript value
 */
export const detectUniversalType = (value) => {
  if (value === null || value === undefined) return UNIVERSAL_TYPES.OBJECT;
  
  if (Number.isInteger(value)) {
    return UNIVERSAL_TYPES.INTEGER;
  } else if (typeof value === 'number') {
    return UNIVERSAL_TYPES.FLOAT;
  } else if (typeof value === 'boolean') {
    return UNIVERSAL_TYPES.BOOLEAN;
  } else if (typeof value === 'string') {
    return UNIVERSAL_TYPES.STRING;
  } else if (Array.isArray(value)) {
    if (value.length === 0) return UNIVERSAL_TYPES.INTEGER_LIST;
    
    const firstElement = value[0];
    if (Number.isInteger(firstElement)) {
      return UNIVERSAL_TYPES.INTEGER_LIST;
    } else if (typeof firstElement === 'number') {
      return UNIVERSAL_TYPES.FLOAT_LIST;
    } else if (typeof firstElement === 'string') {
      return UNIVERSAL_TYPES.STRING_LIST;
    } else if (typeof firstElement === 'boolean') {
      return UNIVERSAL_TYPES.BOOLEAN_ARRAY;
    }
  }
  
  return UNIVERSAL_TYPES.OBJECT;
};

/**
 * Get all supported languages
 */
export const getSupportedLanguages = () => {
  return Object.keys(LANGUAGE_TYPE_MAPPING);
};

/**
 * Check if language is supported
 */
export const isLanguageSupported = (language) => {
  return LANGUAGE_TYPE_MAPPING.hasOwnProperty(language?.toLowerCase());
};

/**
 * Get all valid types for a specific language
 */
export const getValidTypesForLanguage = (language) => {
  const languageMapping = LANGUAGE_TYPE_MAPPING[language?.toLowerCase()];
  if (!languageMapping) return [];
  
  return Object.values(languageMapping).flat();
};

/**
 * Check if a type is valid for a specific language
 */
export const isValidTypeForLanguage = (type, language) => {
  const validTypes = getValidTypesForLanguage(language);
  return validTypes.includes(type);
};

/**
 * Convert test case data for specific language
 */
export const convertTestCaseForLanguage = (testCase, targetLanguage) => {
  try {
    // Parse input data
    const inputData = JSON.parse(testCase.inputData);
    const expectedOutputData = JSON.parse(testCase.expectedOutputData);
    
    // Convert input types
    const convertedInputData = inputData.map(input => ({
      ...input,
      dataType: normalizeDataType(input.dataType, 'java', targetLanguage)
    }));
    
    // Convert output type
    const convertedOutputData = {
      ...expectedOutputData,
      dataType: normalizeDataType(expectedOutputData.dataType, 'java', targetLanguage)
    };
    
    // Convert primary types
    const inputUniversalType = toUniversalType(testCase.inputType, 'java');
    const outputUniversalType = toUniversalType(testCase.outputType, 'java');
    
    return {
      ...testCase,
      inputData: JSON.stringify(convertedInputData),
      expectedOutputData: JSON.stringify(convertedOutputData),
      inputType: toLanguageType(inputUniversalType, targetLanguage),
      outputType: toLanguageType(outputUniversalType, targetLanguage)
    };
    
  } catch (error) {
    console.error('Error converting test case for language:', error);
    return testCase; // Return original if conversion fails
  }
};

/**
 * Language display names for UI
 */
export const LANGUAGE_DISPLAY_NAMES = {
  java: "Java",
  python: "Python", 
  cpp: "C++",
  javascript: "JavaScript"
};

/**
 * Get display name for language
 */
export const getLanguageDisplayName = (language) => {
  return LANGUAGE_DISPLAY_NAMES[language?.toLowerCase()] || language;
};

/**
 * Data type examples for each language
 */
export const DATA_TYPE_EXAMPLES = {
  java: {
    "int": "42",
    "String": "\"hello\"",
    "boolean": "true",
    "int[]": "[1, 2, 3]",
    "List<Integer>": "[1, 2, 3]"
  },
  python: {
    "int": "42",
    "str": "'hello'",
    "bool": "True",
    "List[int]": "[1, 2, 3]"
  },
  cpp: {
    "int": "42",
    "string": "hello",
    "bool": "true",
    "vector<int>": "[1, 2, 3]"
  },
  javascript: {
    "number": "42",
    "string": "\"hello\"",
    "boolean": "true",
    "number[]": "[1, 2, 3]"
  }
};

/**
 * Get example value for a data type in specific language
 */
export const getExampleForType = (dataType, language) => {
  const examples = DATA_TYPE_EXAMPLES[language?.toLowerCase()];
  return examples?.[dataType] || "example_value";
};
