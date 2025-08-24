import axios from "axios";

// AI Service Base URL (RecommendationSystem)
// Use window.location to detect environment or fallback to localhost
const getAIServiceURL = () => {
  // Check if we're in development or production
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:3000";
    }
    // For production, you might want to use a different URL
    return "http://localhost:3000"; // Change this for production
  }
  return "http://localhost:3000";
};

const AI_SERVICE_BASE_URL = getAIServiceURL();

/**
 * AI Test Case Generation API
 * API cho việc sinh test case bằng AI
 */
export const aiTestCaseApi = {
  /**
   * Generate test cases using AI
   * Sinh test cases bằng AI
   */
  generateTestCases: async (requestData) => {
    try {
      console.log(
        "🤖 Calling AI service for test case generation:",
        requestData
      );
      console.log("🌐 AI Service URL:", AI_SERVICE_BASE_URL);

      const payload = {
        title: requestData.title || "Bài toán lập trình",
        description: requestData.description || "Mô tả bài toán",
        constraints: requestData.constraints || "",
        K: requestData.numberOfTestCases || requestData.K || 5,
        problemId: requestData.problemId || 0,
        format: "system", // Request system-compatible format
      };

      console.log("📤 Sending payload:", payload);

      const response = await axios.post(
        `${AI_SERVICE_BASE_URL}/CreateTestCaseAutomation`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      console.log("📥 AI service response status:", response.status);
      console.log("🎉 AI service response data:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error calling AI service:", error);

      // Enhanced error handling
      if (error.code === "ECONNREFUSED") {
        throw new Error(
          "AI service không khả dụng. Vui lòng kiểm tra kết nối."
        );
      } else if (error.response) {
        throw new Error(
          `AI service error: ${error.response.status} - ${
            error.response.data?.error || "Unknown error"
          }`
        );
      } else if (error.request) {
        throw new Error(
          "Không thể kết nối đến AI service. Vui lòng thử lại sau."
        );
      } else {
        throw new Error(`Lỗi không xác định: ${error.message}`);
      }
    }
  },

  /**
   * Generate test cases in batch for multiple problems
   * Sinh test cases hàng loạt cho nhiều bài toán
   */
  generateTestCasesBatch: async (problems) => {
    try {
      console.log(
        "Calling AI service for batch test case generation:",
        problems
      );

      const response = await axios.post(
        `${AI_SERVICE_BASE_URL}/CreateTestCasesBatch`,
        {
          problems: problems.map((problem) => ({
            problemId: problem.id,
            title: problem.title,
            description: problem.description,
            K: problem.numberOfTestCases || 5,
          })),
          format: "system",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 60000, // 60 seconds for batch processing
        }
      );

      console.log("AI batch service response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error calling AI batch service:", error);
      throw error;
    }
  },

  /**
   * Get AI service health status
   * Kiểm tra trạng thái AI service
   */
  getServiceHealth: async () => {
    try {
      // Use root endpoint for health check since /health might not exist
      const response = await axios.get(`${AI_SERVICE_BASE_URL}/`, {
        timeout: 5000,
      });
      return {
        status: "healthy",
        data: response.data,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
      };
    }
  },

  /**
   * Test AI service connection
   * Test kết nối AI service
   */
  testConnection: async () => {
    try {
      const response = await axios.post(
        `${AI_SERVICE_BASE_URL}/test`,
        { test: "connection" },
        { timeout: 5000 }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Add utility methods to main API object for easier access
  transformAIResponseToSystemFormat: (aiResponse, functionSignature = null) => {
    return aiTestCaseUtils.transformAIResponseToSystemFormat(
      aiResponse,
      functionSignature
    );
  },

  validateAITestCases: (testCases, functionSignature = null) => {
    return aiTestCaseUtils.validateAITestCases(testCases, functionSignature);
  },

  generateFallbackTestCases: (
    numberOfTestCases = 5,
    problemType = "general"
  ) => {
    return aiTestCaseUtils.generateFallbackTestCases(
      numberOfTestCases,
      problemType
    );
  },

  formatTestCaseForDisplay: (testCase) => {
    return aiTestCaseUtils.formatTestCaseForDisplay(testCase);
  },
};

/**
 * Utility functions for AI test case processing
 * Các hàm tiện ích cho xử lý AI test case
 */
export const aiTestCaseUtils = {
  /**
   * Transform AI response to system format
   * Chuyển đổi response AI sang format hệ thống
   */
  transformAIResponseToSystemFormat: (aiResponse, functionSignature = null) => {
    if (!aiResponse || !Array.isArray(aiResponse)) {
      return [];
    }

    return aiResponse.map((testCase, index) => {
      // Handle AI response format: {input: [values] or string, output: value, description}
      let inputValue = testCase.input || testCase.inputData || "";
      const outputValue =
        testCase.output ||
        testCase.expectedOutput ||
        testCase.expectedOutputData ||
        "";
      const description = testCase.description || `Test case ${index + 1}`;

      // Auto-detect data types
      const detectDataType = (value) => {
        if (typeof value === "number") return "int";
        if (typeof value === "boolean") return "boolean";
        if (Array.isArray(value)) return "array";
        if (typeof value === "string") {
          // Try to parse as number
          if (!isNaN(value) && !isNaN(parseFloat(value))) return "int";
          // Try to parse as array
          if (value.startsWith("[") && value.endsWith("]")) return "array";
        }
        return "string";
      };

      // Format input data for system - FIXED for multiple parameters
      let inputData;

      if (Array.isArray(inputValue)) {
        // Multiple parameters case
        inputData = JSON.stringify(
          inputValue.map((param, paramIndex) => {
            // Use function signature types if available
            let dataType = "string";
            if (
              functionSignature &&
              functionSignature.parameterTypes &&
              functionSignature.parameterTypes[paramIndex]
            ) {
              const sigType =
                functionSignature.parameterTypes[paramIndex].toLowerCase();
              if (sigType.includes("int") || sigType.includes("number")) {
                dataType = "int";
              } else if (sigType.includes("bool")) {
                dataType = "boolean";
              } else if (sigType.includes("[]") || sigType.includes("array")) {
                dataType = "array";
              } else {
                dataType = "string";
              }
            } else {
              // Fallback to auto-detection
              dataType = detectDataType(param);
            }

            return {
              input: String(param),
              dataType: dataType,
            };
          })
        );
      } else {
        // Single parameter case (legacy)
        const inputType = detectDataType(inputValue);
        inputData = JSON.stringify([
          {
            input: String(inputValue),
            dataType: inputType,
          },
        ]);
      }

      // Format output data for system
      let outputType = detectDataType(outputValue);
      if (functionSignature && functionSignature.returnType) {
        const sigReturnType = functionSignature.returnType.toLowerCase();
        if (sigReturnType.includes("int") || sigReturnType.includes("number")) {
          outputType = "int";
        } else if (sigReturnType.includes("bool")) {
          outputType = "boolean";
        } else if (
          sigReturnType.includes("[]") ||
          sigReturnType.includes("array")
        ) {
          outputType = "array";
        } else {
          outputType = "string";
        }
      }

      const expectedOutputData = JSON.stringify({
        expectedOutput: String(outputValue),
        dataType: outputType,
      });

      return {
        // Remove 'key' field as backend doesn't expect it and it's auto-generated
        description,
        inputData,
        expectedOutputData,
        inputType: Array.isArray(inputValue)
          ? "multiple"
          : detectDataType(inputValue),
        outputType,
        isExample: index < 2, // First 2 are examples
        isHidden: index >= 2, // Rest are hidden
        timeLimit: testCase.timeLimit || 5000,
        memoryLimit: testCase.memoryLimit || 262144,
        weight: testCase.weight || 1.0,
        testOrder: index + 1,
        comparisonMode: testCase.comparisonMode || "EXACT",
        epsilon: testCase.epsilon || null,
      };
    });
  },

  /**
   * Validate AI-generated test cases
   * Validate test cases được AI sinh ra
   */
  validateAITestCases: (testCases, functionSignature = null) => {
    const errors = [];
    const warnings = [];

    if (!Array.isArray(testCases) || testCases.length === 0) {
      errors.push("Không có test cases nào được sinh ra");
      return { isValid: false, errors, warnings };
    }

    testCases.forEach((testCase, index) => {
      const prefix = `Test case ${index + 1}:`;

      // Check required fields
      if (!testCase.description) {
        warnings.push(`${prefix} Thiếu mô tả`);
      }

      if (!testCase.inputData) {
        errors.push(`${prefix} Thiếu input data`);
      }

      if (!testCase.expectedOutputData) {
        errors.push(`${prefix} Thiếu expected output data`);
      }

      // Validate JSON format and extract data for further validation
      let inputArray = null;
      let outputData = null;

      try {
        if (testCase.inputData) {
          inputArray = JSON.parse(testCase.inputData);
          if (!Array.isArray(inputArray)) {
            errors.push(`${prefix} Input data phải là array`);
          }
        }
      } catch {
        errors.push(`${prefix} Input data không phải JSON hợp lệ`);
      }

      try {
        if (testCase.expectedOutputData) {
          outputData = JSON.parse(testCase.expectedOutputData);
        }
      } catch {
        errors.push(`${prefix} Expected output data không phải JSON hợp lệ`);
      }

      // Validate against function signature if provided
      if (functionSignature && inputArray) {
        const expectedParamCount = functionSignature.parameterTypes
          ? functionSignature.parameterTypes.length
          : 0;
        const actualParamCount = inputArray.length;

        if (expectedParamCount > 0 && expectedParamCount !== actualParamCount) {
          errors.push(
            `${prefix} Số lượng parameters không khớp. Mong đợi: ${expectedParamCount}, thực tế: ${actualParamCount}`
          );
        }

        // Validate parameter types
        if (functionSignature.parameterTypes && inputArray.length > 0) {
          inputArray.forEach((param, paramIndex) => {
            if (paramIndex < functionSignature.parameterTypes.length) {
              const expectedType =
                functionSignature.parameterTypes[paramIndex].toLowerCase();
              const actualType = param.dataType
                ? param.dataType.toLowerCase()
                : "unknown";

              // Type mapping validation
              const isTypeMatch = (expected, actual) => {
                if (expected.includes("int") || expected.includes("number")) {
                  return actual === "int" || actual === "number";
                }
                if (expected.includes("string")) {
                  return actual === "string";
                }
                if (expected.includes("bool")) {
                  return actual === "boolean";
                }
                if (expected.includes("[]") || expected.includes("array")) {
                  return actual === "array";
                }
                return true; // Allow unknown types
              };

              if (!isTypeMatch(expectedType, actualType)) {
                warnings.push(
                  `${prefix} Parameter ${
                    paramIndex + 1
                  } type có thể không khớp. Mong đợi: ${expectedType}, thực tế: ${actualType}`
                );
              }
            }
          });
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  /**
   * Generate fallback test cases when AI service is unavailable
   * Sinh test cases dự phòng khi AI service không khả dụng
   */
  generateFallbackTestCases: (
    numberOfTestCases = 5,
    problemType = "general"
  ) => {
    const templates = {
      general: [
        {
          inputData: '[{"input":"test1","dataType":"string"}]',
          expectedOutputData:
            '{"expectedOutput":"result1","dataType":"string"}',
          description: "Test case cơ bản",
        },
        {
          inputData: '[{"input":"test2","dataType":"string"}]',
          expectedOutputData:
            '{"expectedOutput":"result2","dataType":"string"}',
          description: "Test case thứ hai",
        },
      ],
      math: [
        {
          inputData:
            '[{"input":"3","dataType":"int"},{"input":"5","dataType":"int"}]',
          expectedOutputData: '{"expectedOutput":"8","dataType":"int"}',
          description: "Test case với hai số nguyên dương",
        },
        {
          inputData:
            '[{"input":"0","dataType":"int"},{"input":"0","dataType":"int"}]',
          expectedOutputData: '{"expectedOutput":"0","dataType":"int"}',
          description: "Test case với cả hai số bằng 0",
        },
      ],
      array: [
        {
          inputData: '[{"input":"[1,2,3]","dataType":"int[]"}]',
          expectedOutputData: '{"expectedOutput":"6","dataType":"int"}',
          description: "Test case với mảng số nguyên",
        },
        {
          inputData: '[{"input":"[]","dataType":"int[]"}]',
          expectedOutputData: '{"expectedOutput":"0","dataType":"int"}',
          description: "Test case với mảng rỗng",
        },
      ],
    };

    const selectedTemplates = templates[problemType] || templates.general;
    const result = [];

    for (let i = 0; i < numberOfTestCases; i++) {
      const template = selectedTemplates[i % selectedTemplates.length];
      result.push({
        ...template,
        // Remove 'key' field as backend doesn't expect it
        testOrder: i + 1,
        isExample: i < 2,
        isHidden: i >= 2,
        timeLimit: 5000,
        memoryLimit: 262144,
        weight: 1.0,
        comparisonMode: "EXACT",
        inputType: "string",
        outputType: "string",
      });
    }

    return result;
  },

  /**
   * Format test case for display
   * Format test case để hiển thị
   */
  formatTestCaseForDisplay: (testCase) => {
    try {
      const inputData = JSON.parse(testCase.inputData || "[]");
      const outputData = JSON.parse(testCase.expectedOutputData || "{}");

      return {
        ...testCase,
        formattedInput: inputData.map((item) => item.input).join(", "),
        formattedOutput: outputData.expectedOutput || "N/A",
      };
    } catch {
      return {
        ...testCase,
        formattedInput: "Invalid format",
        formattedOutput: "Invalid format",
      };
    }
  },
};

export default aiTestCaseApi;
