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
  Badge,
  Steps,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CodeOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { CodeBlock, atomOneDark } from "react-code-blocks";

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
  inputData: '[{"input":"[1,2,3,4,5]","dataType":"int[]"}]',
  inputType: "array",
  outputType: "integer",
  expectedOutputData: '{"expectedOutput":"4","dataType":"int"}',
  description: "Test with distinct numbers",
  isExample: true,
  isHidden: false,
  timeLimit: 1000,
  memoryLimit: 262144,
  weight: 1.0,
  testOrder: 1,
  comparisonMode: "EXACT",
  epsilon: null,
};

const AdvancedProblemForm = ({ onSubmit, loading, initialValues }) => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");
  const [topics, setTopics] = useState(initialValues?.topics || []);
  const [newTopic, setNewTopic] = useState("");

  // Track which languages are enabled
  const [languageEnabled, setLanguageEnabled] = useState({
    java: true,
    python: true,
    javascript: false,
    cpp: false,
    ...initialValues?.supportedLanguages,
  });

  // Track the selected input type for test case generation guidance
  const [selectedInputType, setSelectedInputType] = useState("array");

  // Keep local state of function signature forms for displaying formatted signature preview
  const [functionSignatures, setFunctionSignatures] = useState({
    java: FUNCTION_TEMPLATES.java,
    python: FUNCTION_TEMPLATES.python,
    javascript: FUNCTION_TEMPLATES.javascript,
    cpp: FUNCTION_TEMPLATES.cpp,
  });

  // Add new state for tracking if it's an update operation
  const [isUpdate, setIsUpdate] = useState(false);

  // Add new state for tracking selected test case index
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);

  // Initialize form with values if editing
  useEffect(() => {
    if (initialValues) {
      setIsUpdate(true);
      initializeForm();
    }
  }, [initialValues]);

  const handleSupportedLanguagesChange = (language, checked) => {
    setLanguageEnabled((prev) => ({
      ...prev,
      [language]: checked,
    }));
  };

  const handleAddTopic = () => {
    if (newTopic && !topics.includes(newTopic)) {
      setTopics([...topics, newTopic]);
      setNewTopic("");
    }
  };

  const handleRemoveTopic = (removedTopic) => {
    setTopics(topics.filter((topic) => topic !== removedTopic));
  };

  const validateFunctionSignature = (_, value) => {
    try {
      const signature = JSON.parse(value);
      if (
        !signature.functionName ||
        !signature.parameterTypes ||
        !signature.returnType
      ) {
        return Promise.reject("Invalid function signature format");
      }
      return Promise.resolve();
    } catch {
      return Promise.reject("Invalid JSON format");
    }
  };

  // Update function signature state when form values change
  const handleFunctionSignatureChange = (language, value) => {
    try {
      const parsedSignature = JSON.parse(value);
      setFunctionSignatures((prev) => ({
        ...prev,
        [language]: parsedSignature,
      }));
    } catch (e) {
      // Keep previous state if parse fails
      console.error("Failed to parse signature:", e);
    }
  };

  // Generate signature preview text
  const getSignaturePreview = (language) => {
    const signature = functionSignatures[language];
    if (!signature) return "";

    switch (language) {
      case "java":
        return `public ${signature.returnType} ${
          signature.functionName
        }(${signature.parameterTypes.join(", ")})`;
      case "python":
        return `def ${signature.functionName}(${signature.parameterTypes
          .map((p) => p.replace(/List\[([^\]]+)\]/, "$1s"))
          .join(", ")}) -> ${signature.returnType}`;
      case "javascript":
        return `function ${signature.functionName}(${signature.parameterTypes
          .map((p) => p.replace(/\[\]$/, "s"))
          .join(", ")}) => ${signature.returnType}`;
      case "cpp":
        return `${signature.returnType} ${
          signature.functionName
        }(${signature.parameterTypes.join(", ")})`;
      default:
        return "";
    }
  };

  // Add new validator functions for test cases
  const validateInputData = (_, value) => {
    try {
      if (!value)
        return Promise.reject(new Error("Dữ liệu đầu vào là bắt buộc"));

      const parsed = JSON.parse(value);

      // Check if it's an array for multiple parameters
      if (!Array.isArray(parsed)) {
        return Promise.reject(
          new Error("Dữ liệu đầu vào phải là một mảng các đối tượng")
        );
      }

      // Check each parameter object
      for (const param of parsed) {
        if (!param.input || !param.dataType) {
          return Promise.reject(
            new Error("Mỗi tham số phải có 'input' và 'dataType'")
          );
        }
      }

      return Promise.resolve();
    } catch {
      return Promise.reject(new Error("Định dạng JSON không hợp lệ"));
    }
  };

  const validateOutputData = (_, value) => {
    try {
      if (!value)
        return Promise.reject(new Error("Dữ liệu đầu ra là bắt buộc"));

      const parsed = JSON.parse(value);

      // Check for required fields
      if (!parsed.expectedOutput || !parsed.dataType) {
        return Promise.reject(
          new Error("Kết quả phải có 'expectedOutput' và 'dataType'")
        );
      }

      return Promise.resolve();
    } catch {
      return Promise.reject(new Error("Định dạng JSON không hợp lệ"));
    }
  };

  // Helper to insert test case examples
  const insertTestCaseExample = (type, index) => {
    const example = TEST_CASE_EXAMPLES[type];
    if (!example) return;

    const testCases = form.getFieldValue("testCases");
    testCases[index].inputData = example.input;
    testCases[index].expectedOutputData = example.output;
    testCases[index].description = example.vietnamese || example.description;

    form.setFieldsValue({ testCases });
  };

  const handleSubmit = (values) => {
    // Only include enabled languages in function signatures
    const enabledFunctionSignatures = {};
    Object.keys(languageEnabled).forEach((lang) => {
      if (languageEnabled[lang]) {
        enabledFunctionSignatures[lang] = values[`${lang}Signature`];
      }
    });

    // Build the complex request data structure
    const formattedValues = {
      createProblem: {
        title: values.title,
        description: values.description,
        difficulty: values.difficulty,
        topics: topics,
        supportedLanguages: languageEnabled,
        functionSignatures: enabledFunctionSignatures,
        constraints: values.constraints || "",
      },
      createTestCases: values.testCases.map((testCase, index) => ({
        ...testCase,
        testOrder: index + 1,
      })),
    };

    onSubmit(formattedValues);
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

      // Initialize test cases from initialValues if exists
      if (initialValues.testCases && initialValues.testCases.length > 0) {
        formData.testCases = initialValues.testCases;
      }

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
        testCases: [TEST_CASE_TEMPLATE],
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
              <Select placeholder="Chọn độ khó">
                <Option value="EASY">Dễ</Option>
                <Option value="MEDIUM">Trung bình</Option>
                <Option value="HARD">Khó</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Chủ đề">
              <div className="flex flex-wrap gap-2 mb-3">
                {topics.map((topic) => (
                  <Tag
                    key={topic}
                    closable
                    onClose={() => handleRemoveTopic(topic)}
                    className="text-sm py-1 px-2"
                  >
                    {topic}
                  </Tag>
                ))}
              </div>
              <Input.Group compact>
                <Input
                  style={{ width: "calc(100% - 80px)" }}
                  placeholder="Thêm chủ đề (Ví dụ: Mảng, Quy hoạch động...)"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onPressEnter={handleAddTopic}
                />
                <Button type="primary" onClick={handleAddTopic}>
                  <PlusOutlined /> Thêm
                </Button>
              </Input.Group>
            </Form.Item>
          </Card>
        </TabPane>

        <TabPane tab="Function Signature" key="2">
          <Card>
            <Alert
              message="Function Signature"
              description="Đầu tiên, chọn các ngôn ngữ lập trình bạn muốn hỗ trợ, sau đó định nghĩa Function Signature cho mỗi ngôn ngữ."
              type="info"
              showIcon
              className="mb-4"
            />

            <Title level={4} className="mb-4">
              1. Chọn ngôn ngữ hỗ trợ
            </Title>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card
                className={`border-2 ${
                  languageEnabled.java ? "border-blue-500" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Java</span>
                  <Switch
                    checked={languageEnabled.java}
                    onChange={(checked) =>
                      handleSupportedLanguagesChange("java", checked)
                    }
                  />
                </div>
              </Card>
              <Card
                className={`border-2 ${
                  languageEnabled.python ? "border-blue-500" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">Python</span>
                  <Switch
                    checked={languageEnabled.python}
                    onChange={(checked) =>
                      handleSupportedLanguagesChange("python", checked)
                    }
                  />
                </div>
              </Card>
              <Card
                className={`border-2 ${
                  languageEnabled.javascript
                    ? "border-blue-500"
                    : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">JavaScript</span>
                  <Switch
                    checked={languageEnabled.javascript}
                    onChange={(checked) =>
                      handleSupportedLanguagesChange("javascript", checked)
                    }
                  />
                </div>
              </Card>
              <Card
                className={`border-2 ${
                  languageEnabled.cpp ? "border-blue-500" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">C++</span>
                  <Switch
                    checked={languageEnabled.cpp}
                    onChange={(checked) =>
                      handleSupportedLanguagesChange("cpp", checked)
                    }
                  />
                </div>
              </Card>
            </div>

            <Divider />

            <Title level={4} className="mb-4">
              2. Định nghĩa Function Signature
            </Title>
            <Alert
              message="Cách định nghĩa Function Signature"
              description={
                <ul className="list-disc pl-5">
                  <li>Xác định tên hàm, kiểu tham số và kiểu trả về</li>
                  <li>Sử dụng định dạng JSON như trong các ví dụ</li>
                  <li>Xem trước Function Signature sẽ cập nhật khi bạn nhập</li>
                </ul>
              }
              type="info"
              className="mb-4"
            />

            <Collapse defaultActiveKey={["java", "python"]}>
              {languageEnabled.java && (
                <Panel
                  header={
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Function Signature Java
                      </span>
                      <Badge
                        status="success"
                        text={getSignaturePreview("java")}
                      />
                    </div>
                  }
                  key="java"
                >
                  <Alert
                    message="Các kiểu dữ liệu Java phổ biến"
                    description={
                      <ul className="list-disc pl-5">
                        <li>
                          <strong>Mảng:</strong> {DATA_TYPES.java.array}
                        </li>
                        <li>
                          <strong>Chuỗi:</strong> {DATA_TYPES.java.string}
                        </li>
                        <li>
                          <strong>Số nguyên:</strong> {DATA_TYPES.java.integer}
                        </li>
                        <li>
                          <strong>Số thực:</strong> {DATA_TYPES.java.float}
                        </li>
                        <li>
                          <strong>Boolean:</strong> {DATA_TYPES.java.boolean}
                        </li>
                        <li>
                          <strong>Đối tượng:</strong> {DATA_TYPES.java.object}
                        </li>
                      </ul>
                    }
                    type="info"
                    className="mb-4"
                  />
                  <Form.Item
                    name="javaSignature"
                    rules={[
                      {
                        required: languageEnabled.java,
                        message: "Function Signature Java là bắt buộc",
                      },
                      { validator: validateFunctionSignature },
                    ]}
                  >
                    <TextArea
                      rows={6}
                      onChange={(e) =>
                        handleFunctionSignatureChange("java", e.target.value)
                      }
                    />
                  </Form.Item>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-2">
                    <Title level={5}>Mẫu triển khai</Title>
                    <CodeBlock
                      text={CODE_TEMPLATES.java}
                      language="java"
                      theme={atomOneDark}
                      showLineNumbers
                    />
                  </div>
                </Panel>
              )}

              {languageEnabled.python && (
                <Panel
                  header={
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        Function Signature Python
                      </span>
                      <Badge
                        status="success"
                        text={getSignaturePreview("python")}
                      />
                    </div>
                  }
                  key="python"
                >
                  <Alert
                    message="Các kiểu dữ liệu Python phổ biến"
                    description={
                      <ul className="list-disc pl-5">
                        <li>
                          <strong>Mảng:</strong> {DATA_TYPES.python.array}
                        </li>
                        <li>
                          <strong>Chuỗi:</strong> {DATA_TYPES.python.string}
                        </li>
                        <li>
                          <strong>Số nguyên:</strong>{" "}
                          {DATA_TYPES.python.integer}
                        </li>
                        <li>
                          <strong>Số thực:</strong> {DATA_TYPES.python.float}
                        </li>
                        <li>
                          <strong>Boolean:</strong> {DATA_TYPES.python.boolean}
                        </li>
                        <li>
                          <strong>Đối tượng:</strong> {DATA_TYPES.python.object}
                        </li>
                      </ul>
                    }
                    type="info"
                    className="mb-4"
                  />
                  <Form.Item
                    name="pythonSignature"
                    rules={[
                      {
                        required: languageEnabled.python,
                        message: "Function Signature Python là bắt buộc",
                      },
                      { validator: validateFunctionSignature },
                    ]}
                  >
                    <TextArea
                      rows={6}
                      onChange={(e) =>
                        handleFunctionSignatureChange("python", e.target.value)
                      }
                    />
                  </Form.Item>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-2">
                    <Title level={5}>Mẫu triển khai</Title>
                    <CodeBlock
                      text={CODE_TEMPLATES.python}
                      language="python"
                      theme={atomOneDark}
                      showLineNumbers
                    />
                  </div>
                </Panel>
              )}

              {languageEnabled.javascript && (
                <Panel
                  header={
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        JavaScript Function Signature
                      </span>
                      <Badge
                        status="success"
                        text={getSignaturePreview("javascript")}
                      />
                    </div>
                  }
                  key="javascript"
                >
                  <Form.Item
                    name="javascriptSignature"
                    rules={[
                      {
                        required: languageEnabled.javascript,
                        message: "JavaScript signature is required",
                      },
                      { validator: validateFunctionSignature },
                    ]}
                  >
                    <TextArea
                      rows={6}
                      onChange={(e) =>
                        handleFunctionSignatureChange(
                          "javascript",
                          e.target.value
                        )
                      }
                    />
                  </Form.Item>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-2">
                    <Title level={5}>Example Implementation</Title>
                    <CodeBlock
                      text={CODE_TEMPLATES.javascript}
                      language="javascript"
                      theme={atomOneDark}
                      showLineNumbers
                    />
                  </div>
                </Panel>
              )}

              {languageEnabled.cpp && (
                <Panel
                  header={
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        C++ Function Signature
                      </span>
                      <Badge
                        status="success"
                        text={getSignaturePreview("cpp")}
                      />
                    </div>
                  }
                  key="cpp"
                >
                  <Form.Item
                    name="cppSignature"
                    rules={[
                      {
                        required: languageEnabled.cpp,
                        message: "C++ signature is required",
                      },
                      { validator: validateFunctionSignature },
                    ]}
                  >
                    <TextArea
                      rows={6}
                      onChange={(e) =>
                        handleFunctionSignatureChange("cpp", e.target.value)
                      }
                    />
                  </Form.Item>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-2">
                    <Title level={5}>Example Implementation</Title>
                    <CodeBlock
                      text={CODE_TEMPLATES.cpp}
                      language="cpp"
                      theme={atomOneDark}
                      showLineNumbers
                    />
                  </div>
                </Panel>
              )}
            </Collapse>
          </Card>
        </TabPane>

        <TabPane tab="Test Cases" key="3">
          <Card className="mb-6">
            <Alert
              message="Hướng dẫn tạo Test Cases"
              description={
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Tạo test cases hiệu quả cho bài toán
                  </h3>
                  <div
                    className="mb-4"
                    dangerouslySetInnerHTML={{
                      __html: VI_INSTRUCTIONS.testCaseGuide,
                    }}
                  ></div>

                  <h3 className="text-lg font-semibold mb-2">
                    {VI_INSTRUCTIONS.inputFormatTitle}
                  </h3>
                  <pre className="bg-gray-100 p-3 rounded mb-3 text-sm">
                    {VI_INSTRUCTIONS.inputFormatDesc}
                  </pre>

                  <h3 className="text-lg font-semibold mb-2">
                    {VI_INSTRUCTIONS.outputFormatTitle}
                  </h3>
                  <pre className="bg-gray-100 p-3 rounded mb-3 text-sm">
                    {VI_INSTRUCTIONS.outputFormatDesc}
                  </pre>

                  <div
                    className="mb-2 mt-4"
                    dangerouslySetInnerHTML={{
                      __html: VI_INSTRUCTIONS.testCaseValidationTips,
                    }}
                  ></div>

                  <h3 className="text-lg font-semibold mb-2">Mẫu test case</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button
                      onClick={() => {
                        setSelectedTestCaseIndex(0);
                        insertTestCaseExample("array", 0);
                      }}
                    >
                      Mẫu mảng
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedTestCaseIndex(0);
                        insertTestCaseExample("string", 0);
                      }}
                    >
                      Mẫu chuỗi
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedTestCaseIndex(0);
                        insertTestCaseExample("twoParams", 0);
                      }}
                    >
                      Mẫu nhiều tham số
                    </Button>
                  </div>
                </div>
              }
              type="info"
              showIcon
              className="mb-6"
            />

            <Form.List name="testCases">
              {(fields, { add, remove }) => (
                <>
                  {fields.length > 0 && (
                    <div className="mb-4">
                      <Steps
                        type="navigation"
                        size="small"
                        current={selectedTestCaseIndex}
                        onChange={(current) =>
                          setSelectedTestCaseIndex(current)
                        }
                        className="mb-4"
                      >
                        {fields.map((field, index) => (
                          <Step
                            key={field.key}
                            title={`Test Case #${index + 1}`}
                            status={
                              index === selectedTestCaseIndex
                                ? "process"
                                : "wait"
                            }
                            description={
                              form.getFieldValue([
                                "testCases",
                                index,
                                "description",
                              ]) || `Test ${index + 1}`
                            }
                          />
                        ))}
                      </Steps>
                    </div>
                  )}

                  {fields.map(({ key, name, ...restField }, index) => (
                    <div
                      key={key}
                      style={{
                        display:
                          index === selectedTestCaseIndex ? "block" : "none",
                      }}
                    >
                      <Card
                        className="mb-4"
                        title={
                          <Space>
                            <Badge
                              status={index === 0 ? "processing" : "default"}
                            />
                            <span className="font-medium">
                              Test Case #{name + 1}
                            </span>
                            {isUpdate &&
                              initialValues?.testCases &&
                              initialValues.testCases[name] && (
                                <Tag color="green">Đã tồn tại</Tag>
                              )}
                          </Space>
                        }
                        extra={
                          <Space>
                            {index > 0 && (
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => {
                                  remove(name);
                                  if (
                                    selectedTestCaseIndex >=
                                    fields.length - 1
                                  ) {
                                    setSelectedTestCaseIndex(fields.length - 2);
                                  }
                                }}
                              >
                                Xóa
                              </Button>
                            )}
                          </Space>
                        }
                      >
                        <Steps
                          size="small"
                          className="mb-6"
                          current={3}
                          direction="horizontal"
                        >
                          <Step title="Đầu vào" />
                          <Step title="Đầu ra" />
                          <Step title="Cài đặt" />
                        </Steps>

                        <Title level={5} className="flex items-center mb-3">
                          <span className="bg-blue-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2">
                            1
                          </span>
                          Dữ liệu đầu vào
                          <Tooltip title="Định nghĩa dữ liệu đầu vào cho hàm">
                            <InfoCircleOutlined className="ml-2 text-gray-400" />
                          </Tooltip>
                        </Title>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <Form.Item
                            {...restField}
                            name={[name, "inputType"]}
                            label="Loại dữ liệu đầu vào"
                            className="mb-2"
                          >
                            <Select
                              onChange={(value) => setSelectedInputType(value)}
                              placeholder="Chọn kiểu dữ liệu đầu vào"
                            >
                              <Option value="array">Mảng</Option>
                              <Option value="string">Chuỗi</Option>
                              <Option value="integer">Số nguyên</Option>
                              <Option value="object">Đối tượng</Option>
                            </Select>
                          </Form.Item>
                        </div>

                        <Form.Item
                          {...restField}
                          name={[name, "inputData"]}
                          label={
                            <div className="flex items-center">
                              Dữ liệu đầu vào (JSON)
                              <Tooltip
                                title={
                                  <div>
                                    <p>
                                      <strong>Định dạng mẫu:</strong>{" "}
                                      <code>
                                        [
                                        {`{"input":"giá_trị","dataType":"kiểu_dữ_liệu"}`}
                                        ]
                                      </code>
                                    </p>
                                    <p>
                                      Các ví dụ cho{" "}
                                      <strong>{selectedInputType}</strong>:
                                    </p>
                                    <div className="mt-1">
                                      {Object.keys(languageEnabled)
                                        .filter((lang) => languageEnabled[lang])
                                        .map((lang) => (
                                          <div key={lang} className="mb-1">
                                            <strong>{lang}:</strong>{" "}
                                            {DATA_TYPES[lang]?.[
                                              selectedInputType
                                            ] || "Kiểu không khả dụng"}
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                }
                              >
                                <InfoCircleOutlined className="ml-2 text-gray-400" />
                              </Tooltip>
                            </div>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Dữ liệu đầu vào là bắt buộc",
                            },
                            { validator: validateInputData },
                          ]}
                          help="Ví dụ: [{'input':'[1,2,3,4,5]','dataType':'int[]'}]"
                        >
                          <TextArea
                            rows={4}
                            placeholder='[{"input":"[1,2,3,4,5]","dataType":"int[]"}]'
                          />
                        </Form.Item>

                        <Divider />

                        <Title level={5} className="flex items-center mb-3">
                          <span className="bg-green-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2">
                            2
                          </span>
                          Kết quả mong đợi
                          <Tooltip title="Định nghĩa kết quả mong đợi từ hàm">
                            <InfoCircleOutlined className="ml-2 text-gray-400" />
                          </Tooltip>
                        </Title>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <Form.Item
                            {...restField}
                            name={[name, "outputType"]}
                            label="Loại dữ liệu đầu ra"
                            className="mb-2"
                          >
                            <Select placeholder="Chọn kiểu dữ liệu đầu ra">
                              <Option value="integer">Số nguyên</Option>
                              <Option value="array">Mảng</Option>
                              <Option value="string">Chuỗi</Option>
                              <Option value="boolean">Boolean</Option>
                              <Option value="object">Đối tượng</Option>
                            </Select>
                          </Form.Item>
                        </div>

                        <Form.Item
                          {...restField}
                          name={[name, "expectedOutputData"]}
                          label={
                            <div className="flex items-center">
                              Dữ liệu đầu ra (JSON)
                              <Tooltip title="Định dạng: {'expectedOutput':'giá_trị','dataType':'kiểu_dữ_liệu'}">
                                <InfoCircleOutlined className="ml-2 text-gray-400" />
                              </Tooltip>
                            </div>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Dữ liệu đầu ra là bắt buộc",
                            },
                            { validator: validateOutputData },
                          ]}
                          help="Ví dụ: {'expectedOutput':'4','dataType':'int'}"
                        >
                          <TextArea
                            rows={3}
                            placeholder='{"expectedOutput":"4","dataType":"int"}'
                          />
                        </Form.Item>

                        <Divider />

                        <Title level={5} className="flex items-center mb-3">
                          <span className="bg-purple-500 text-white rounded-full h-6 w-6 flex items-center justify-center mr-2">
                            3
                          </span>
                          Cài đặt Test Case
                          <Tooltip title="Cấu hình thuộc tính của test case">
                            <InfoCircleOutlined className="ml-2 text-gray-400" />
                          </Tooltip>
                        </Title>

                        <Form.Item
                          {...restField}
                          name={[name, "description"]}
                          label="Mô tả"
                          rules={[
                            {
                              required: true,
                              message: "Mô tả là bắt buộc",
                            },
                          ]}
                        >
                          <Input placeholder="Ví dụ: Test với mảng số nguyên khác nhau" />
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <Form.Item
                            {...restField}
                            name={[name, "timeLimit"]}
                            label={
                              <span>
                                Giới hạn thời gian (ms)
                                <Tooltip title="Thời gian thực thi tối đa được phép">
                                  <InfoCircleOutlined className="ml-1 text-gray-400" />
                                </Tooltip>
                              </span>
                            }
                            rules={[
                              {
                                required: true,
                                message: "Giới hạn thời gian là bắt buộc",
                              },
                            ]}
                          >
                            <InputNumber
                              min={100}
                              max={10000}
                              className="w-full"
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "memoryLimit"]}
                            label={
                              <span>
                                Giới hạn bộ nhớ (KB)
                                <Tooltip title="Bộ nhớ sử dụng tối đa được phép">
                                  <InfoCircleOutlined className="ml-1 text-gray-400" />
                                </Tooltip>
                              </span>
                            }
                            rules={[
                              {
                                required: true,
                                message: "Giới hạn bộ nhớ là bắt buộc",
                              },
                            ]}
                          >
                            <InputNumber
                              min={1024}
                              max={1048576}
                              className="w-full"
                            />
                          </Form.Item>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Form.Item
                            {...restField}
                            name={[name, "weight"]}
                            label={
                              <span>
                                Trọng số
                                <Tooltip title="Tầm quan trọng của test case này (trọng số càng cao = nhiều điểm hơn)">
                                  <InfoCircleOutlined className="ml-1 text-gray-400" />
                                </Tooltip>
                              </span>
                            }
                            rules={[
                              {
                                required: true,
                                message: "Trọng số là bắt buộc",
                              },
                            ]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              step={0.5}
                              className="w-full"
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "comparisonMode"]}
                            label={
                              <span>
                                Chế độ so sánh
                                <Tooltip title="Cách so sánh đầu ra mong đợi với đầu ra thực tế">
                                  <InfoCircleOutlined className="ml-1 text-gray-400" />
                                </Tooltip>
                              </span>
                            }
                            rules={[
                              {
                                required: true,
                                message: "Chế độ so sánh là bắt buộc",
                              },
                            ]}
                          >
                            <Select>
                              <Option value="EXACT">So khớp chính xác</Option>
                              <Option value="NUMERIC">
                                Số học (có dung sai)
                              </Option>
                              <Option value="STRING_IGNORE_CASE">
                                Chuỗi (bỏ qua hoa thường)
                              </Option>
                            </Select>
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "epsilon"]}
                            label={
                              <span>
                                Epsilon (cho so sánh số học)
                                <Tooltip title="Dung sai cho so sánh số thực">
                                  <InfoCircleOutlined className="ml-1 text-gray-400" />
                                </Tooltip>
                              </span>
                            }
                          >
                            <InputNumber
                              min={0}
                              max={1}
                              step={0.001}
                              className="w-full"
                            />
                          </Form.Item>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          <Form.Item
                            {...restField}
                            name={[name, "isExample"]}
                            valuePropName="checked"
                            label={
                              <span>
                                Hiển thị như ví dụ
                                <Tooltip title="Hiển thị cho người dùng như một ví dụ">
                                  <InfoCircleOutlined className="ml-1 text-gray-400" />
                                </Tooltip>
                              </span>
                            }
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "isHidden"]}
                            valuePropName="checked"
                            label={
                              <span>
                                Test case ẩn
                                <Tooltip title="Test case không hiển thị cho người dùng">
                                  <InfoCircleOutlined className="ml-1 text-gray-400" />
                                </Tooltip>
                              </span>
                            }
                          >
                            <Switch />
                          </Form.Item>
                        </div>
                      </Card>
                    </div>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => {
                        add(TEST_CASE_TEMPLATE);
                        setSelectedTestCaseIndex(fields.length);
                      }}
                      block
                      icon={<PlusOutlined />}
                      className="h-16"
                    >
                      Thêm Test Case
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>
        </TabPane>
      </Tabs>

      <div className="flex justify-between mt-6">
        <Button
          type="default"
          onClick={() => {
            if (activeTab === "1") {
              setActiveTab("3");
            } else {
              setActiveTab(String(Number(activeTab) - 1));
            }
          }}
          disabled={activeTab === "1"}
        >
          Trước
        </Button>

        <Space>
          {activeTab !== "3" ? (
            <Button
              type="primary"
              onClick={() => setActiveTab(String(Number(activeTab) + 1))}
            >
              Tiếp theo
            </Button>
          ) : (
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<CodeOutlined />}
            >
              {initialValues ? "Cập nhật bài toán" : "Tạo bài toán"}
            </Button>
          )}
        </Space>
      </div>
    </Form>
  );
};

export default AdvancedProblemForm;
