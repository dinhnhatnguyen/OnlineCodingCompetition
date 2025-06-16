/**
 * Kiểm tra tính hợp lệ của function signature theo ngôn ngữ
 * @param {string} language - Ngôn ngữ lập trình (java, python, javascript, cpp)
 * @param {Object} signature - Thông tin function signature
 * @returns {Object} - Kết quả kiểm tra {isValid: boolean, message: string}
 */
export const validateFunctionSignature = (language, signature) => {
  if (!language || !signature) {
    return { isValid: false, message: "Ngôn ngữ và signature không được để trống" };
  }

  const { functionName, parameterTypes, returnType } = signature;

  // Kiểm tra tên hàm
  if (!functionName || functionName.trim() === "") {
    return { isValid: false, message: "Tên hàm không được để trống" };
  }

  // Kiểm tra tên hàm theo quy tắc của từng ngôn ngữ
  const nameValidation = validateFunctionName(language, functionName);
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  // Kiểm tra kiểu dữ liệu tham số
  if (!parameterTypes || parameterTypes.length === 0) {
    return { isValid: false, message: "Cần ít nhất một tham số" };
  }

  // Kiểm tra từng kiểu dữ liệu tham số
  for (let i = 0; i < parameterTypes.length; i++) {
    const paramType = parameterTypes[i];
    const paramValidation = validateParameterType(language, paramType);
    if (!paramValidation.isValid) {
      return { isValid: false, message: `Tham số ${i + 1}: ${paramValidation.message}` };
    }
  }

  // Kiểm tra kiểu dữ liệu trả về
  if (!returnType || returnType.trim() === "") {
    return { isValid: false, message: "Kiểu dữ liệu trả về không được để trống" };
  }

  const returnValidation = validateReturnType(language, returnType);
  if (!returnValidation.isValid) {
    return returnValidation;
  }

  return { isValid: true, message: "Function signature hợp lệ" };
};

/**
 * Kiểm tra tính hợp lệ của tên hàm
 * @param {string} language - Ngôn ngữ lập trình
 * @param {string} functionName - Tên hàm
 * @returns {Object} - Kết quả kiểm tra
 */
const validateFunctionName = (language, functionName) => {
  // Regex cho tên hàm theo từng ngôn ngữ
  const patterns = {
    java: /^[a-zA-Z][a-zA-Z0-9_]*$/,
    python: /^[a-z][a-z0-9_]*$/,
    javascript: /^[a-zA-Z$_][a-zA-Z0-9$_]*$/,
    cpp: /^[a-zA-Z][a-zA-Z0-9_]*$/
  };

  if (!patterns[language].test(functionName)) {
    let message = "Tên hàm không hợp lệ. ";
    
    switch (language) {
      case "java":
        message += "Tên hàm Java phải bắt đầu bằng chữ cái và chỉ chứa chữ cái, số hoặc dấu gạch dưới.";
        break;
      case "python":
        message += "Tên hàm Python phải bắt đầu bằng chữ cái thường và chỉ chứa chữ cái thường, số hoặc dấu gạch dưới.";
        break;
      case "javascript":
        message += "Tên hàm JavaScript phải bắt đầu bằng chữ cái, $ hoặc _ và chỉ chứa chữ cái, số, $ hoặc _.";
        break;
      case "cpp":
        message += "Tên hàm C++ phải bắt đầu bằng chữ cái và chỉ chứa chữ cái, số hoặc dấu gạch dưới.";
        break;
    }
    
    return { isValid: false, message };
  }

  return { isValid: true, message: "Tên hàm hợp lệ" };
};

/**
 * Kiểm tra tính hợp lệ của kiểu dữ liệu tham số
 * @param {string} language - Ngôn ngữ lập trình
 * @param {string} paramType - Kiểu dữ liệu tham số
 * @returns {Object} - Kết quả kiểm tra
 */
const validateParameterType = (language, paramType) => {
  if (!paramType || paramType.trim() === "") {
    return { isValid: false, message: "Kiểu dữ liệu tham số không được để trống" };
  }

  // Danh sách kiểu dữ liệu hợp lệ cho từng ngôn ngữ
  const validTypes = {
    java: [
      "int", "Integer", "long", "Long", "short", "Short", "byte", "Byte",
      "float", "Float", "double", "Double",
      "boolean", "Boolean",
      "char", "Character",
      "String",
      "int[]", "Integer[]", "long[]", "Long[]", "double[]", "Double[]", "boolean[]", "Boolean[]", "String[]",
      "List<Integer>", "List<String>", "List<Boolean>", "List<Double>",
      "Map<String,Integer>", "Map<String,String>", "HashMap<String,Integer>", "HashMap<String,String>"
    ],
    python: [
      "int", "float", "bool", "str",
      "List[int]", "List[float]", "List[bool]", "List[str]",
      "Dict[str,int]", "Dict[str,str]", "Dict[str,float]",
      "tuple", "set"
    ],
    javascript: [
      "number", "string", "boolean",
      "Array<number>", "Array<string>", "Array<boolean>",
      "object", "Map", "Set"
    ],
    cpp: [
      "int", "long", "short", "float", "double", "bool", "char", "string",
      "vector<int>", "vector<string>", "vector<bool>", "vector<double>",
      "map<string,int>", "map<string,string>"
    ]
  };

  // Kiểm tra kiểu dữ liệu tùy chỉnh (custom class)
  if (language === "java" && /^[A-Z][a-zA-Z0-9_]*$/.test(paramType)) {
    return { isValid: true, message: "Kiểu dữ liệu tùy chỉnh hợp lệ" };
  }

  // Kiểm tra kiểu dữ liệu có trong danh sách hợp lệ
  if (!validTypes[language].includes(paramType)) {
    return { 
      isValid: false, 
      message: `Kiểu dữ liệu "${paramType}" không hợp lệ cho ngôn ngữ ${language}` 
    };
  }

  return { isValid: true, message: "Kiểu dữ liệu tham số hợp lệ" };
};

/**
 * Kiểm tra tính hợp lệ của kiểu dữ liệu trả về
 * @param {string} language - Ngôn ngữ lập trình
 * @param {string} returnType - Kiểu dữ liệu trả về
 * @returns {Object} - Kết quả kiểm tra
 */
const validateReturnType = (language, returnType) => {
  // Tương tự như validateParameterType nhưng thêm void/None/undefined
  if (!returnType || returnType.trim() === "") {
    return { isValid: false, message: "Kiểu dữ liệu trả về không được để trống" };
  }

  // Danh sách kiểu dữ liệu trả về hợp lệ cho từng ngôn ngữ
  const validReturnTypes = {
    java: [
      "void", "int", "Integer", "long", "Long", "short", "Short", "byte", "Byte",
      "float", "Float", "double", "Double",
      "boolean", "Boolean",
      "char", "Character",
      "String",
      "int[]", "Integer[]", "long[]", "Long[]", "double[]", "Double[]", "boolean[]", "Boolean[]", "String[]",
      "List<Integer>", "List<String>", "List<Boolean>", "List<Double>",
      "Map<String,Integer>", "Map<String,String>", "HashMap<String,Integer>", "HashMap<String,String>"
    ],
    python: [
      "None", "int", "float", "bool", "str",
      "List[int]", "List[float]", "List[bool]", "List[str]",
      "Dict[str,int]", "Dict[str,str]", "Dict[str,float]",
      "tuple", "set"
    ],
    javascript: [
      "void", "number", "string", "boolean", "undefined",
      "Array<number>", "Array<string>", "Array<boolean>",
      "object", "Map", "Set"
    ],
    cpp: [
      "void", "int", "long", "short", "float", "double", "bool", "char", "string",
      "vector<int>", "vector<string>", "vector<bool>", "vector<double>",
      "map<string,int>", "map<string,string>"
    ]
  };

  // Kiểm tra kiểu dữ liệu tùy chỉnh (custom class)
  if (language === "java" && /^[A-Z][a-zA-Z0-9_]*$/.test(returnType)) {
    return { isValid: true, message: "Kiểu dữ liệu trả về tùy chỉnh hợp lệ" };
  }

  // Kiểm tra kiểu dữ liệu có trong danh sách hợp lệ
  if (!validReturnTypes[language].includes(returnType)) {
    return { 
      isValid: false, 
      message: `Kiểu dữ liệu trả về "${returnType}" không hợp lệ cho ngôn ngữ ${language}` 
    };
  }

  return { isValid: true, message: "Kiểu dữ liệu trả về hợp lệ" };
};