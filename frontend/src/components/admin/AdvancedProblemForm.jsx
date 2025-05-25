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
    const inputData = inputs.map((input) => ({
      input: input.value,
      dataType: input.type,
    }));
    form.setFieldValue([field.name, "inputData"], JSON.stringify(inputData));
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
  const [newTopic, setNewTopic] = useState("");

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

  const handleSupportedLanguagesChange = (language, checked) => {
    setLanguageEnabled((prev) => ({
      ...prev,
      [language]: checked,
    }));
  };

  const handleSubmit = async (values) => {
    try {
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

      // Prepare data for submission
      const formData = {
        createProblem: {
          title: values.title,
          description: values.description,
          difficulty: values.difficulty,
          constraints: values.constraints,
          topics: topics,
          supportedLanguages: languageEnabled,
          functionSignatures: functionSignatures,
        },
      };

      // Chỉ thêm test cases nếu đang tạo mới problem
      if (isCreating && values.testCases) {
        formData.createTestCases = values.testCases.map((testCase, index) => ({
          ...testCase,
          testOrder: index + 1,
        }));
      } else if (!isCreating) {
        // Nếu đang chỉnh sửa, giữ nguyên test cases cũ
        formData.createProblem.testCases = initialValues?.testCases || [];
      }

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
              <Space wrap>
                {topics.map((topic, index) => (
                  <Tag
                    key={index}
                    closable
                    onClose={() => setTopics(topics.filter((t) => t !== topic))}
                  >
                    {topic}
                  </Tag>
                ))}
              </Space>
              <div className="mt-2 flex gap-2">
                <Input
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  onPressEnter={(e) => {
                    e.preventDefault();
                    if (newTopic && !topics.includes(newTopic)) {
                      setTopics([...topics, newTopic]);
                      setNewTopic("");
                    }
                  }}
                  placeholder="Thêm chủ đề mới"
                />
                <Button
                  type="primary"
                  onClick={() => {
                    if (newTopic && !topics.includes(newTopic)) {
                      setTopics([...topics, newTopic]);
                      setNewTopic("");
                    }
                  }}
                >
                  <PlusOutlined /> Thêm
                </Button>
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
                  </div>
                }
                type="info"
                showIcon
                className="mb-6"
              />

              <Form.List name="testCases">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map((field, index) => (
                      <Card
                        key={field.key}
                        className="mb-4"
                        title={
                          <Space>
                            <span className="font-medium">
                              Test Case #{index + 1}
                            </span>
                          </Space>
                        }
                        extra={
                          <Space>
                            {index > 0 && (
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => remove(field.name)}
                              >
                                Xóa
                              </Button>
                            )}
                          </Space>
                        }
                      >
                        <Form.Item {...field} label="Dữ liệu đầu vào" required>
                          <TestCaseInputForm form={form} field={field} />
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, "expectedOutput"]}
                          label="Giá trị đầu ra mong đợi"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập giá trị đầu ra",
                            },
                          ]}
                        >
                          <div className="flex items-center gap-2">
                            <Input
                              className="flex-1"
                              placeholder="Nhập giá trị đầu ra"
                              onChange={(e) => {
                                const type = form.getFieldValue([
                                  field.name,
                                  "expectedOutputType",
                                ]);
                                form.setFieldValue(
                                  [field.name, "expectedOutputData"],
                                  JSON.stringify({
                                    expectedOutput: e.target.value,
                                    dataType: type,
                                  })
                                );
                              }}
                            />
                            <Form.Item
                              {...field}
                              name={[field.name, "expectedOutputType"]}
                              className="flex-1 mb-0"
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng chọn kiểu dữ liệu",
                                },
                              ]}
                            >
                              <Select
                                placeholder="Chọn kiểu dữ liệu"
                                onChange={(value) => {
                                  const output = form.getFieldValue([
                                    field.name,
                                    "expectedOutput",
                                  ]);
                                  form.setFieldValue(
                                    [field.name, "expectedOutputData"],
                                    JSON.stringify({
                                      expectedOutput: output,
                                      dataType: value,
                                    })
                                  );
                                }}
                              >
                                {Object.entries(DATA_TYPES.java).map(
                                  ([key, types]) => (
                                    <Select.OptGroup
                                      key={key}
                                      label={key.toUpperCase()}
                                    >
                                      {types.split(", ").map((type) => (
                                        <Option
                                          key={`${key}-${type}`}
                                          value={type}
                                        >
                                          {type}
                                        </Option>
                                      ))}
                                    </Select.OptGroup>
                                  )
                                )}
                              </Select>
                            </Form.Item>
                          </div>
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, "description"]}
                          label="Mô tả"
                          rules={[
                            { required: true, message: "Vui lòng nhập mô tả" },
                          ]}
                        >
                          <Input placeholder="Ví dụ: Test với mảng số nguyên khác nhau" />
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Form.Item
                            {...field}
                            name={[field.name, "timeLimit"]}
                            label="Giới hạn thời gian (ms)"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập giới hạn thời gian",
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
                            {...field}
                            name={[field.name, "memoryLimit"]}
                            label="Giới hạn bộ nhớ (KB)"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập giới hạn bộ nhớ",
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Form.Item
                            {...field}
                            name={[field.name, "isExample"]}
                            valuePropName="checked"
                            label="Hiển thị như ví dụ"
                          >
                            <Switch />
                          </Form.Item>

                          <Form.Item
                            {...field}
                            name={[field.name, "isHidden"]}
                            valuePropName="checked"
                            label="Test case ẩn"
                          >
                            <Switch />
                          </Form.Item>
                        </div>
                      </Card>
                    ))}

                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add(TEST_CASE_TEMPLATE)}
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm Test Case
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>
          </TabPane>
        )}
      </Tabs>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isCreating ? "Tạo bài toán" : "Cập nhật bài toán"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AdvancedProblemForm;
