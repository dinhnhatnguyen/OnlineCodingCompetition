/**
 * Utility functions for test case validation and data type detection
 * Used by the enhanced test case creation system
 */

/**
 * Smart data type detection function
 * @param {*} value - The value to detect type for
 * @returns {string} - The detected data type
 */
export const detectDataType = (value) => {
  if (value === null || value === undefined || value === "") {
    return "string";
  }

  const strValue = String(value).trim();

  // Check for array format
  if (strValue.startsWith("[") && strValue.endsWith("]")) {
    return "array";
  }

  // Check for boolean
  if (strValue === "true" || strValue === "false") {
    return "boolean";
  }

  // Check for number (integer or float)
  if (!isNaN(strValue) && !isNaN(parseFloat(strValue))) {
    return strValue.includes(".") ? "double" : "int";
  }

  // Default to string
  return "string";
};

/**
 * Validates a complete test case object against the required structure
 * @param {Object} testCase - The test case to validate
 * @returns {Object} - Validation result with errors and warnings
 */
export const validateTestCaseStructure = (testCase) => {
  const errors = [];
  const warnings = [];

  // Required fields check
  const requiredFields = [
    "inputData",
    "inputType",
    "outputType",
    "expectedOutputData",
    "description",
    "isExample",
    "isHidden",
    "timeLimit",
    "memoryLimit",
    "weight",
    "testOrder",
    "comparisonMode",
  ];

  requiredFields.forEach((field) => {
    if (testCase[field] === undefined || testCase[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate JSON fields
  try {
    const inputData = JSON.parse(testCase.inputData || "[]");
    if (!Array.isArray(inputData)) {
      errors.push("inputData must be a JSON array");
    } else {
      inputData.forEach((item, idx) => {
        if (!item.hasOwnProperty("input") || !item.hasOwnProperty("dataType")) {
          errors.push(
            `Input item ${idx + 1} missing 'input' or 'dataType' field`
          );
        }
      });
    }
  } catch (e) {
    errors.push("inputData must be valid JSON");
  }

  try {
    const outputData = JSON.parse(testCase.expectedOutputData || "{}");
    if (
      !outputData.hasOwnProperty("expectedOutput") ||
      !outputData.hasOwnProperty("dataType")
    ) {
      errors.push("expectedOutputData missing required fields");
    }
  } catch (e) {
    errors.push("expectedOutputData must be valid JSON");
  }

  // Validate numeric fields
  if (testCase.timeLimit && testCase.timeLimit < 100) {
    errors.push("timeLimit must be at least 100ms");
  }

  if (testCase.memoryLimit && testCase.memoryLimit < 1024) {
    errors.push("memoryLimit must be at least 1024KB");
  }

  if (testCase.weight && (testCase.weight < 0.1 || testCase.weight > 10)) {
    warnings.push("weight should be between 0.1 and 10");
  }

  if (testCase.testOrder && testCase.testOrder < 1) {
    errors.push("testOrder must be greater than 0");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Creates a complete test case object with all required fields
 * @param {Object} partialTestCase - Partial test case data
 * @returns {Object} - Complete test case object
 */
export const createCompleteTestCase = (partialTestCase = {}) => {
  const defaults = {
    inputData: JSON.stringify([{ input: "", dataType: "string" }]),
    inputType: "string",
    outputType: "string",
    expectedOutputData: JSON.stringify({
      expectedOutput: "",
      dataType: "string",
    }),
    description: "Test case",
    isExample: false,
    isHidden: false,
    timeLimit: 1000,
    memoryLimit: 262144,
    weight: 1.0,
    testOrder: 1,
    comparisonMode: "EXACT",
    epsilon: null,
  };

  return { ...defaults, ...partialTestCase };
};

/**
 * Formats test cases for API submission
 * @param {Array} testCases - Array of test case objects
 * @returns {Array} - Formatted test cases ready for API submission
 */
export const formatTestCasesForAPI = (testCases) => {
  return testCases.map((testCase, index) => {
    const formatted = createCompleteTestCase(testCase);
    formatted.testOrder = index + 1;
    return formatted;
  });
};

/**
 * Validates and fixes test case data for API submission
 * @param {Array} testCases - Array of test case objects
 * @returns {Object} - { isValid: boolean, errors: string[], fixedTestCases: Array }
 */
export const validateAndFixTestCasesForAPI = (testCases) => {
  const errors = [];
  const fixedTestCases = [];

  if (!Array.isArray(testCases)) {
    return {
      isValid: false,
      errors: ["Test cases must be an array"],
      fixedTestCases: [],
    };
  }

  if (testCases.length < 2) {
    errors.push("At least 2 test cases are required");
  }

  testCases.forEach((testCase, index) => {
    const validation = validateTestCaseStructure(testCase);

    if (!validation.isValid) {
      errors.push(`Test case ${index + 1}: ${validation.errors.join(", ")}`);
    }

    // Try to fix the test case
    const fixedTestCase = createCompleteTestCase(testCase);
    fixedTestCase.testOrder = index + 1;

    // Ensure JSON fields are valid
    try {
      if (typeof fixedTestCase.inputData === "string") {
        JSON.parse(fixedTestCase.inputData);
      }
    } catch (e) {
      fixedTestCase.inputData = JSON.stringify([
        { input: "", dataType: "string" },
      ]);
      errors.push(`Test case ${index + 1}: Fixed invalid inputData JSON`);
    }

    try {
      if (typeof fixedTestCase.expectedOutputData === "string") {
        JSON.parse(fixedTestCase.expectedOutputData);
      }
    } catch (e) {
      fixedTestCase.expectedOutputData = JSON.stringify({
        expectedOutput: "",
        dataType: "string",
      });
      errors.push(
        `Test case ${index + 1}: Fixed invalid expectedOutputData JSON`
      );
    }

    fixedTestCases.push(fixedTestCase);
  });

  return {
    isValid: errors.length === 0,
    errors,
    fixedTestCases,
  };
};
