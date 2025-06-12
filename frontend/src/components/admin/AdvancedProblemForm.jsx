import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Card,
  Tabs,
  Switch,
  Space,
  Divider,
  Typography,
  Tag,
  Tooltip,
  Alert,
  InputNumber,
  Collapse,
  Steps,
  Checkbox,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { validateFunctionSignature } from "../../utils/functionSignatureValidator";
import { validateAndFixTestCasesForAPI } from "../../utils/testCaseValidation";
import SuperchargedTestCaseManager from "./SuperchargedTestCaseManager";
import TestCaseDebugger from "./TestCaseDebugger";
import { getAllTopics } from "../../api/problemApi";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Step } = Steps;

const CODE_TEMPLATES = {
  java: [
    "public int findSecondMax(int[] nums) {",
    "    // Write your code here",
    "    return 0;",
    "}",
  ].join("\n"),
  python: [
    "def find_second_max(nums):",
    "    # Write your code here",
    "    return 0",
  ].join("\n"),
  javascript: [
    "function findSecondMax(nums) {",
    "    // Write your code here",
    "    return 0;",
    "}",
  ].join("\n"),
  cpp: [
    "#include <vector>",
    "",
    "int findSecondMax(std::vector<int> nums) {",
    "    // Write your code here",
    "    return 0;",
    "}",
  ].join("\n"),
};

const FUNCTION_TEMPLATES = {
  java: {
    functionName: "findSecondMax",
    parameterTypes: ["int[]"],
    returnType: "int",
  },
  python: {
    functionName: "find_second_max",
    parameterTypes: ["List[int]"],
    returnType: "int",
  },
  javascript: {
    functionName: "findSecondMax",
    parameterTypes: ["number[]"],
    returnType: "number",
  },
  cpp: {
    functionName: "findSecondMax",
    parameterTypes: ["vector<int>"],
    returnType: "int",
  },
};

// Sample data types by language - Add more comprehensive type information
const DATA_TYPES = {
  java: {
    array: "int[], Integer[], String[], boolean[], char[], long[], double[]",
    string: "String",
    integer: "int, long, Integer, Long, short, byte",
    float: "float, double, Float, Double",
    boolean: "boolean, Boolean",
    object: "Object, Map<K,V>, HashMap<K,V>, List<E>, ArrayList<E>, Set<E>",
    custom: "YourClassName",
  },
  python: {
    array: "List[int], List[str], List[bool], List[float], tuple, set",
    string: "str",
    integer: "int",
    float: "float",
    boolean: "bool",
    object: "dict, object, Dict[K,V], collections.defaultdict",
    custom: "YourClassName",
  },
  javascript: {
    array: "number[], string[], boolean[], Array<number>, Array<string>",
    string: "string",
    integer: "number",
    float: "number",
    boolean: "boolean",
    object: "object, Map, Set, Record<string, any>",
    custom: "YourClassName",
  },
  cpp: {
    array: "vector<int>, vector<string>, vector<bool>, array<int, N>, list<T>",
    string: "string, char*, const char*",
    integer: "int, long, short, size_t, int64_t",
    float: "float, double",
    boolean: "bool",
    object: "map<K,V>, unordered_map<K,V>, pair<T,U>, struct",
    custom: "YourClassName",
  },
};

// Vietnamese instructions for input/output formats
const VI_INSTRUCTIONS = {
  inputFormatTitle: "Định dạng dữ liệu đầu vào",
  inputFormatDesc: `
    - Mảng: Sử dụng dấu ngoặc vuông [1,2,3,4,5]
    - Chuỗi: Sử dụng dấu ngoặc kép "hello world" 
    - Số nguyên: Nhập trực tiếp không cần dấu ngoặc 42
    - Số thập phân: Sử dụng dấu chấm 3.14
    - Kiểu boolean: true hoặc false
  `,
  multipleParamsDesc: `
    Với nhiều tham số, tạo nhiều đối tượng trong mảng JSON:
    [{"input":"[1,2,3]","dataType":"int[]"},{"input":"2","dataType":"int"}]
  `,
  outputFormatTitle: "Định dạng kết quả đầu ra",
  outputFormatDesc: `
    Format: {"expectedOutput":"giá_trị","dataType":"kiểu_dữ_liệu"}
    
    Ví dụ:
    - Số nguyên: {"expectedOutput":"42","dataType":"int"}
    - Chuỗi: {"expectedOutput":"Hello World","dataType":"String"}
    - Mảng: {"expectedOutput":"[1,2,3]","dataType":"int[]"}
  `,
  testCaseExplanation:
    "Mỗi test case bao gồm dữ liệu đầu vào, kết quả mong đợi và các cài đặt khác.",
  testCaseGuide: `
    <h4>Hướng dẫn tạo test case hiệu quả:</h4>
    <ol>
      <li><strong>Bắt đầu với các test case đơn giản</strong> - giúp hiểu cách giải quyết vấn đề</li>
      <li><strong>Thêm test case cho trường hợp biên</strong> - giá trị giới hạn, rỗng, số âm, v.v.</li>
      <li><strong>Tạo các test case phức tạp hơn</strong> - để đánh giá hiệu suất và độ chính xác</li>
      <li><strong>Đặt tên và mô tả test case rõ ràng</strong> - để hiểu mục đích của từng test</li>
    </ol>
  `,
  testCaseValidationTips: `
    <h4>Lưu ý khi tạo test case:</h4>
    <ul>
      <li><strong>Cấu trúc JSON hợp lệ</strong> - đảm bảo cú pháp đúng với dấu ngoặc và dấu phẩy</li>
      <li><strong>Định dạng dữ liệu phù hợp</strong> - mảng nằm trong ngoặc vuông, chuỗi trong dấu ngoặc kép</li>
      <li><strong>Kiểu dữ liệu phù hợp</strong> - kiểu đầu vào và đầu ra phải tương thích với ngôn ngữ</li>
      <li><strong>Xác minh tính đúng đắn</strong> - đảm bảo kết quả đầu ra đúng với đầu vào</li>
    </ul>
  `,
};

// Example test cases with explanations in Vietnamese
const TEST_CASE_EXAMPLES = {
  array: {
    input: '[{"input":"[1,2,3,4,5]","dataType":"int[]"}]',
    output: '{"expectedOutput":"4","dataType":"int"}',
    description: "Mảng số nguyên đơn giản",
    vietnamese:
      "Mảng số nguyên [1,2,3,4,5] cần tìm giá trị lớn thứ 2 (kết quả là 4)",
  },
  string: {
    input: '[{"input":"hello","dataType":"String"}]',
    output: '{"expectedOutput":"HELLO","dataType":"String"}',
    description: "Xử lý chuỗi đơn giản",
    vietnamese: 'Chuỗi "hello" cần chuyển thành chữ hoa (kết quả là "HELLO")',
  },
  twoParams: {
    input:
      '[{"input":"[1,2,3,4,5]","dataType":"int[]"},{"input":"2","dataType":"int"}]',
    output: '{"expectedOutput":"2","dataType":"int"}',
    description: "Mảng và chỉ số",
    vietnamese:
      "Mảng [1,2,3,4,5] và chỉ số 2, cần tìm phần tử tại vị trí đó (kết quả là 3 nhưng do chỉ số bắt đầu từ 0 nên là 2)",
  },
};

// Test case template with proper formatting
const TEST_CASE_TEMPLATE = {
  inputData: "",
  inputType: "",
  outputType: "",
  expectedOutputData: "",
  description: "",
  isExample: false,
  isHidden: false,
  timeLimit: 1000,
  memoryLimit: 262144,
  weight: 1.0,
  testOrder: 1,
  comparisonMode: "EXACT",
  epsilon: null,
};

const FunctionSignatureForm = ({ language, form }) => {
  const [parameterCount, setParameterCount] = useState(1);
  const dataTypes = DATA_TYPES[language];

  const handleAddParameter = () => {
    setParameterCount((prev) => prev + 1);
  };

  const handleRemoveParameter = (index) => {
    setParameterCount((prev) => prev - 1);
    // Remove the parameter from form
    const currentSignature = form.getFieldValue(`${language}Signature`);
    if (currentSignature) {
      const parsedSignature = JSON.parse(currentSignature);
      parsedSignature.parameterTypes.splice(index, 1);
      form.setFieldValue(
        `${language}Signature`,
        JSON.stringify(parsedSignature, null, 2)
      );
    }
  };

  const updateSignature = (values) => {
    const signature = {
      functionName: values.functionName || "",
      parameterTypes: values.parameterTypes || [],
      returnType: values.returnType || "",
    };

    // Validate signature
    const validation = validateFunctionSignature;
    // Ensure the signature is valid before updating
    if (
      signature.functionName ||
      signature.parameterTypes.length > 0 ||
      signature.returnType
    ) {
      form.setFieldValue(
        `${language}Signature`,
        JSON.stringify(signature, null, 2)
      );
    }
  };

  // Convert string types to array for Select
  const getTypeOptions = (typeString) => {
    if (!typeString) return [];
    return typeString.split(", ").map((type) => ({
      label: type,
      value: type,
    }));
  };

  // Flatten all data types into one array for the selectors
  const allTypes = Object.values(dataTypes).reduce((acc, curr) => {
    return [...acc, ...getTypeOptions(curr)];
  }, []);

  return (
    <div className="space-y-4">
      <Form.Item
        label="Tên hàm"
        name={`${language}FunctionName`}
        rules={[{ required: true, message: "Vui lòng nhập tên hàm" }]}
      >
        <Input
          placeholder={
            language === "python" ? "find_max_value" : "findMaxValue"
          }
          onChange={(e) =>
            updateSignature({
              functionName: e.target.value,
              parameterTypes: form.getFieldValue(`${language}ParameterTypes`),
              returnType: form.getFieldValue(`${language}ReturnType`),
            })
          }
        />
      </Form.Item>

      <div className="space-y-2">
        <label className="block">Tham số</label>
        {Array.from({ length: parameterCount }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Form.Item
              className="flex-1 mb-0"
              name={`${language}ParameterTypes${index}`}
              rules={[
                { required: true, message: "Vui lòng chọn kiểu dữ liệu" },
              ]}
            >
              <Select
                placeholder="Chọn kiểu dữ liệu"
                options={allTypes}
                onChange={() => {
                  const types = Array.from({ length: parameterCount })
                    .map((_, i) =>
                      form.getFieldValue(`${language}ParameterTypes${i}`)
                    )
                    .filter(Boolean);
                  updateSignature({
                    functionName: form.getFieldValue(`${language}FunctionName`),
                    parameterTypes: types,
                    returnType: form.getFieldValue(`${language}ReturnType`),
                  });
                }}
              />
            </Form.Item>
            {index === parameterCount - 1 ? (
              <Button
                type="dashed"
                onClick={handleAddParameter}
                icon={<PlusOutlined />}
              >
                Thêm
              </Button>
            ) : (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveParameter(index)}
              />
            )}
          </div>
        ))}
      </div>

      <Form.Item
        label="Kiểu trả về"
        name={`${language}ReturnType`}
        rules={[{ required: true, message: "Vui lòng chọn kiểu trả về" }]}
      >
        <Select
          placeholder="Chọn kiểu trả về"
          options={allTypes}
          onChange={(value) =>
            updateSignature({
              functionName: form.getFieldValue(`${language}FunctionName`),
              parameterTypes: Array.from({ length: parameterCount })
                .map((_, i) =>
                  form.getFieldValue(`${language}ParameterTypes${i}`)
                )
                .filter(Boolean),
              returnType: value,
            })
          }
        />
      </Form.Item>
    </div>
  );
};

const TestCaseInputForm = ({ form, field }) => {
  const [inputCount, setInputCount] = useState(1);

  const handleAddInput = () => {
    setInputCount((prev) => prev + 1);
  };

  const handleRemoveInput = (index) => {
    setInputCount((prev) => prev - 1);
    // Remove the input from form
    const currentInputs = form.getFieldValue([field.name, "inputs"]) || [];
    currentInputs.splice(index, 1);
    form.setFieldValue([field.name, "inputs"], currentInputs);
    updateInputData();
  };

  const updateInputData = () => {
    const inputs = form.getFieldValue([field.name, "inputs"]) || [];
    // Format input data theo đúng cấu trúc mà backend mong đợi
    const formattedInputs = inputs
      .filter((input) => input && input.value && input.type)
      .map((input) => ({
        input: input.value,
        dataType: input.type,
      }));

    if (formattedInputs.length > 0) {
      form.setFieldValue(
        [field.name, "inputData"],
        JSON.stringify(formattedInputs)
      );
      // Cập nhật inputType dựa trên type của input đầu tiên
      form.setFieldValue(
        [field.name, "inputType"],
        formattedInputs[0].dataType
      );
    }
  };

  // Get example value based on type
  const getExampleValue = (type) => {
    switch (type) {
      case "int":
      case "Integer":
        return "42";
      case "int[]":
      case "Integer[]":
        return "[1, 2, 3]";
      case "String":
        return '"hello"';
      case "boolean":
      case "Boolean":
        return "true";
      case "float":
      case "double":
        return "3.14";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {Array.from({ length: inputCount }).map((_, index) => (
        <div key={index} className="flex items-center gap-2">
          <Form.Item
            className="flex-1 mb-0"
            name={[field.name, "inputs", index, "type"]}
            rules={[{ required: true, message: "Vui lòng chọn kiểu dữ liệu" }]}
          >
            <Select
              placeholder="Chọn kiểu dữ liệu"
              onChange={(value) => {
                // Set example value when type changes
                form.setFieldValue(
                  [field.name, "inputs", index, "value"],
                  getExampleValue(value)
                );
                updateInputData();
              }}
            >
              {Object.entries(DATA_TYPES.java).map(([key, types]) => (
                <Select.OptGroup key={key} label={key.toUpperCase()}>
                  {types.split(", ").map((type) => (
                    <Option key={`${key}-${type}`} value={type}>
                      {type}
                    </Option>
                  ))}
                </Select.OptGroup>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            className="flex-1 mb-0"
            name={[field.name, "inputs", index, "value"]}
            rules={[{ required: true, message: "Vui lòng nhập giá trị" }]}
          >
            <Input
              placeholder="Nhập giá trị"
              onChange={() => updateInputData()}
            />
          </Form.Item>
          {index === inputCount - 1 ? (
            <Button
              type="dashed"
              onClick={handleAddInput}
              icon={<PlusOutlined />}
            >
              Thêm
            </Button>
          ) : (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveInput(index)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const AdvancedProblemForm = ({
  onSubmit,
  loading,
  initialValues,
  isCreating = false,
}) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");
  const [topics, setTopics] = useState(initialValues?.topics || []);
  const [showDebugger, setShowDebugger] = useState(false);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  // Test function to debug form data
  const testFormData = () => {
    console.log("=== TESTING FORM DATA ===");
    const values = form.getFieldsValue();
    const testCases = form.getFieldValue("testCases");
    console.log("All form values:", values);
    console.log("Test cases specifically:", testCases);
    console.log("Test cases length:", testCases?.length);
    console.log("Test cases type:", typeof testCases);
    console.log("Test cases is array:", Array.isArray(testCases));

    if (testCases && testCases.length > 0) {
      console.log("First test case:", testCases[0]);
      console.log("First test case keys:", Object.keys(testCases[0]));
    }
  };

  // Track which languages are enabled
  const [languageEnabled, setLanguageEnabled] = useState({
    java: true,
    python: true,
    javascript: false,
    cpp: false,
    ...initialValues?.supportedLanguages,
  });

  // Initialize form with values if editing
  useEffect(() => {
    if (initialValues) {
      initializeForm();
    }
  }, [initialValues]);

  // Load available topics from database
  useEffect(() => {
    const loadTopics = async () => {
      try {
        setLoadingTopics(true);
        const topics = await getAllTopics();
        setAvailableTopics(topics);
      } catch (error) {
        console.error("Error loading topics:", error);
        message.error("Không thể tải danh sách chủ đề");
      } finally {
        setLoadingTopics(false);
      }
    };

    loadTopics();
  }, []);

  const handleSupportedLanguagesChange = (language, checked) => {
    setLanguageEnabled((prev) => ({
      ...prev,
      [language]: checked,
    }));
  };

  const handleSubmit = async (values) => {
    try {
      console.log("=== FORM SUBMIT STARTED ===");
      console.log("Form values received:", values);

      // Force sync test cases from SuperchargedTestCaseManager
      const currentFormTestCases = form.getFieldValue("testCases");
      console.log("Current form test cases:", currentFormTestCases);

      // Kiểm tra xem có ít nhất một ngôn ngữ được bật không
      const enabledLanguages = Object.entries(languageEnabled).filter(
        ([, enabled]) => enabled
      );
      if (enabledLanguages.length === 0) {
        message.error({
          content: "Vui lòng chọn ít nhất một ngôn ngữ lập trình",
          duration: 5,
          style: {
            marginTop: "20vh",
          },
        });
        return;
      }

      // Get function signatures for enabled languages
      const functionSignatures = {};
      let hasValidSignature = false;

      // Xử lý function signatures cho từng ngôn ngữ được bật
      for (const [lang, enabled] of enabledLanguages) {
        if (enabled) {
          const functionName = values[`${lang}FunctionName`];
          const returnType = values[`${lang}ReturnType`];
          const parameterTypes = Array.from({
            length: form.getFieldValue(`${lang}ParameterCount`) || 1,
          })
            .map((_, i) => form.getFieldValue(`${lang}ParameterTypes${i}`))
            .filter(Boolean);

          if (functionName && returnType && parameterTypes.length > 0) {
            const signature = {
              functionName,
              parameterTypes,
              returnType,
            };
            functionSignatures[lang] = JSON.stringify(signature);
            hasValidSignature = true;
          }
        }
      }

      if (!hasValidSignature) {
        message.error({
          content:
            "Vui lòng định nghĩa function signature cho ít nhất một ngôn ngữ",
          duration: 5,
          style: {
            marginTop: "20vh",
          },
        });
        return;
      }

      // Format and validate test cases data
      let formattedTestCases = [];

      console.log("=== DEBUG TEST CASES ===");
      console.log("isCreating:", isCreating);
      console.log("values:", values);
      console.log("values.testCases:", values.testCases);
      console.log(
        "form.getFieldValue('testCases'):",
        form.getFieldValue("testCases")
      );

      // Try to get test cases from multiple sources
      const testCasesFromValues = values.testCases;
      const testCasesFromForm = form.getFieldValue("testCases");
      const allFormValues = form.getFieldsValue();
      const testCasesFromAllValues = allFormValues.testCases;

      // Use the first non-empty source, prioritizing form values
      const testCasesToUse =
        testCasesFromForm ||
        testCasesFromAllValues ||
        testCasesFromValues ||
        [];

      console.log("testCasesToUse:", testCasesToUse);
      console.log("testCasesToUse.length:", testCasesToUse.length);
      console.log("testCasesToUse type:", typeof testCasesToUse);
      console.log("testCasesToUse is array:", Array.isArray(testCasesToUse));

      if (isCreating) {
        if (
          !testCasesToUse ||
          !Array.isArray(testCasesToUse) ||
          testCasesToUse.length === 0
        ) {
          console.error("No test cases found!");
          message.error("Vui lòng tạo ít nhất 2 test cases trước khi submit");
          return;
        }

        if (testCasesToUse.length < 2) {
          console.error("Not enough test cases!");
          message.error("Cần ít nhất 2 test cases để tạo bài toán");
          return;
        }
        console.log("Processing test cases:", testCasesToUse);

        // Use the validation utility to ensure proper format
        const validation = validateAndFixTestCasesForAPI(testCasesToUse);

        if (!validation.isValid) {
          console.error("Test case validation errors:", validation.errors);
          message.error(
            `Test case validation failed: ${validation.errors.join(", ")}`
          );
          return;
        }

        formattedTestCases = validation.fixedTestCases;
        console.log("Validated and fixed test cases:", formattedTestCases);

        if (validation.errors.length > 0) {
          message.warning(
            `Test cases were auto-fixed: ${validation.errors.join(", ")}`
          );
        }
      }

      console.log("Final formatted test cases for API:", formattedTestCases);

      // Prepare data for submission
      const formData = {
        createProblem: {
          title: values.title?.trim(),
          description: values.description?.trim(),
          difficulty: values.difficulty,
          constraints: values.constraints?.trim() || "",
          topics: topics,
          supportedLanguages: languageEnabled,
          functionSignatures: functionSignatures,
        },
        createTestCases: formattedTestCases,
      };

      console.log("Submitting data:", formData);
      await onSubmit(formData);
      message.success({
        content: isCreating
          ? "Tạo bài toán mới thành công!"
          : "Cập nhật bài toán thành công!",
        duration: 5,
        style: {
          marginTop: "20vh",
        },
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error({
        content: "Không thể gửi form. Vui lòng thử lại.",
        duration: 5,
        style: {
          marginTop: "20vh",
        },
      });
    }
  };

  const initializeForm = () => {
    if (initialValues) {
      // Map existing data to the form structure
      const formData = {
        ...initialValues,
        javaSignature:
          initialValues.functionSignatures?.java ||
          JSON.stringify(FUNCTION_TEMPLATES.java, null, 2),
        pythonSignature:
          initialValues.functionSignatures?.python ||
          JSON.stringify(FUNCTION_TEMPLATES.python, null, 2),
        javascriptSignature:
          initialValues.functionSignatures?.javascript ||
          JSON.stringify(FUNCTION_TEMPLATES.javascript, null, 2),
        cppSignature:
          initialValues.functionSignatures?.cpp ||
          JSON.stringify(FUNCTION_TEMPLATES.cpp, null, 2),
      };

      form.setFieldsValue(formData);

      // Update topics state
      if (initialValues.topics) {
        setTopics(initialValues.topics);
      }

      // Update language enabled state
      if (initialValues.supportedLanguages) {
        setLanguageEnabled(initialValues.supportedLanguages);
      }
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        difficulty: "MEDIUM",
        testCases: isCreating ? [TEST_CASE_TEMPLATE] : [],
        javaSignature: JSON.stringify(FUNCTION_TEMPLATES.java, null, 2),
        pythonSignature: JSON.stringify(FUNCTION_TEMPLATES.python, null, 2),
        javascriptSignature: JSON.stringify(
          FUNCTION_TEMPLATES.javascript,
          null,
          2
        ),
        cppSignature: JSON.stringify(FUNCTION_TEMPLATES.cpp, null, 2),
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="mb-6"
      >
        <TabPane tab="Thông tin cơ bản" key="1">
          <Card>
            <Form.Item
              name="title"
              label="Tiêu đề bài toán"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input placeholder="Ví dụ: Tìm giá trị lớn thứ 2 trong mảng" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <TextArea
                rows={10}
                placeholder="Mô tả chi tiết về bài toán, bao gồm yêu cầu, cách thức xử lý đầu vào/đầu ra và các ví dụ minh họa"
              />
            </Form.Item>

            <Form.Item name="constraints" label="Ràng buộc">
              <TextArea
                rows={3}
                placeholder="Ví dụ: 1 ≤ độ dài mảng ≤ 10^5, -10^9 ≤ giá trị phần tử ≤ 10^9"
              />
            </Form.Item>

            <Form.Item
              name="difficulty"
              label="Độ khó"
              rules={[{ required: true, message: "Vui lòng chọn độ khó" }]}
            >
              <Select>
                <Option value="EASY">Dễ</Option>
                <Option value="MEDIUM">Trung bình</Option>
                <Option value="HARD">Khó</Option>
              </Select>
            </Form.Item>

            <div className="mb-4">
              <label className="block mb-2">Chủ đề</label>
              <Select
                mode="tags"
                style={{ width: "100%" }}
                placeholder="Chọn chủ đề có sẵn hoặc nhập chủ đề mới"
                value={topics}
                onChange={setTopics}
                loading={loadingTopics}
                notFoundContent={
                  loadingTopics ? "Đang tải..." : "Không tìm thấy chủ đề"
                }
                tokenSeparators={[","]}
                maxTagCount="responsive"
              >
                {availableTopics.map((topic) => (
                  <Option key={topic} value={topic}>
                    {topic}
                  </Option>
                ))}
              </Select>
              <div className="text-sm text-gray-500 mt-1">
                💡 Bạn có thể chọn từ danh sách có sẵn hoặc gõ để thêm chủ đề
                mới
              </div>
            </div>
          </Card>
        </TabPane>

        <TabPane tab="Function Signatures" key="2">
          <Card>
            <div className="mb-4">
              <label className="block mb-2">Ngôn ngữ được hỗ trợ</label>
              <Space wrap>
                <Checkbox
                  checked={languageEnabled.java}
                  onChange={(e) =>
                    handleSupportedLanguagesChange("java", e.target.checked)
                  }
                >
                  Java
                </Checkbox>
                <Checkbox
                  checked={languageEnabled.python}
                  onChange={(e) =>
                    handleSupportedLanguagesChange("python", e.target.checked)
                  }
                >
                  Python
                </Checkbox>
                <Checkbox
                  checked={languageEnabled.javascript}
                  onChange={(e) =>
                    handleSupportedLanguagesChange(
                      "javascript",
                      e.target.checked
                    )
                  }
                >
                  JavaScript
                </Checkbox>
                <Checkbox
                  checked={languageEnabled.cpp}
                  onChange={(e) =>
                    handleSupportedLanguagesChange("cpp", e.target.checked)
                  }
                >
                  C++
                </Checkbox>
              </Space>
            </div>

            <Collapse defaultActiveKey={["java"]}>
              {languageEnabled.java && (
                <Panel header="Java Function Signature" key="java">
                  <FunctionSignatureForm language="java" form={form} />
                </Panel>
              )}
              {languageEnabled.python && (
                <Panel header="Python Function Signature" key="python">
                  <FunctionSignatureForm language="python" form={form} />
                </Panel>
              )}
              {languageEnabled.javascript && (
                <Panel header="JavaScript Function Signature" key="javascript">
                  <FunctionSignatureForm language="javascript" form={form} />
                </Panel>
              )}
              {languageEnabled.cpp && (
                <Panel header="C++ Function Signature" key="cpp">
                  <FunctionSignatureForm language="cpp" form={form} />
                </Panel>
              )}
            </Collapse>
          </Card>
        </TabPane>

        {isCreating && (
          <TabPane tab="⚡ Test Cases" key="3">
            <SuperchargedTestCaseManager
              form={form}
              onTestCasesChange={(testCases) => {
                console.log(
                  "AdvancedProblemForm - onTestCasesChange called with:",
                  testCases
                );
                // Update form with new test cases
                form.setFieldValue("testCases", testCases);

                // Verify the form field was set
                const formTestCases = form.getFieldValue("testCases");
                console.log(
                  "AdvancedProblemForm - Form test cases after setting:",
                  formTestCases
                );

                message.success(`Đã cập nhật ${testCases.length} test cases!`);
              }}
            />
          </TabPane>
        )}
      </Tabs>

      {/* Hidden field to ensure test cases are included in form submission */}
      {isCreating && (
        <Form.Item name="testCases" style={{ display: "none" }}>
          <Input type="hidden" />
        </Form.Item>
      )}

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isCreating ? "Tạo bài toán" : "Cập nhật bài toán"}
          </Button>
          {isCreating && (
            <>
              <Button
                type="dashed"
                onClick={() => setShowDebugger(!showDebugger)}
              >
                {showDebugger ? "Hide" : "Show"} Debugger
              </Button>
              <Button type="default" onClick={testFormData}>
                🔍 Test Form Data
              </Button>
            </>
          )}
        </Space>
      </Form.Item>

      {isCreating && <TestCaseDebugger form={form} visible={showDebugger} />}
    </Form>
  );
};

export default AdvancedProblemForm;
