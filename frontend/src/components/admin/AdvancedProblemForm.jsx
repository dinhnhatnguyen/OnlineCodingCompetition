import React, { useState } from "react";
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
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CodeOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text } = Typography;

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
  const [languageEnabled, setLanguageEnabled] = useState({
    java: true,
    python: true,
    javascript: true,
    cpp: true,
    ...initialValues?.supportedLanguages,
  });

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

  const handleSubmit = (values) => {
    // Build the complex request data structure
    const formattedValues = {
      createProblem: {
        title: values.title,
        description: values.description,
        difficulty: values.difficulty,
        topics: topics,
        supportedLanguages: languageEnabled,
        functionSignatures: {
          java: values.javaSignature,
          python: values.pythonSignature,
          javascript: values.javascriptSignature,
          cpp: values.cppSignature,
        },
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
      form.setFieldsValue({
        ...initialValues,
        javaSignature:
          initialValues.functionSignatures?.java ||
          JSON.stringify(FUNCTION_TEMPLATES.java),
        pythonSignature:
          initialValues.functionSignatures?.python ||
          JSON.stringify(FUNCTION_TEMPLATES.python),
        javascriptSignature:
          initialValues.functionSignatures?.javascript ||
          JSON.stringify(FUNCTION_TEMPLATES.javascript),
        cppSignature:
          initialValues.functionSignatures?.cpp ||
          JSON.stringify(FUNCTION_TEMPLATES.cpp),
      });
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
      onMount={initializeForm}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        className="mb-6"
      >
        <TabPane tab="Basic Information" key="1">
          <Card>
            <Form.Item
              name="title"
              label="Problem Title"
              rules={[{ required: true, message: "Please enter a title" }]}
            >
              <Input placeholder="e.g., Find the Second Maximum Value in an Array" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Problem Description"
              rules={[
                { required: true, message: "Please enter a description" },
              ]}
            >
              <TextArea
                rows={10}
                placeholder="Describe the problem in detail, including requirements, input/output format, and examples"
              />
            </Form.Item>

            <Form.Item name="constraints" label="Constraints">
              <TextArea
                rows={3}
                placeholder="e.g., 1 ≤ array.length ≤ 10^5, -10^9 ≤ array[i] ≤ 10^9"
              />
            </Form.Item>

            <Form.Item
              name="difficulty"
              label="Difficulty"
              rules={[
                { required: true, message: "Please select a difficulty" },
              ]}
            >
              <Select>
                <Option value="EASY">Easy</Option>
                <Option value="MEDIUM">Medium</Option>
                <Option value="HARD">Hard</Option>
              </Select>
            </Form.Item>

            <Divider>Topics</Divider>

            <Space className="mb-3" style={{ flexWrap: "wrap" }}>
              {topics.map((topic) => (
                <Tag
                  key={topic}
                  closable
                  onClose={() => handleRemoveTopic(topic)}
                >
                  {topic}
                </Tag>
              ))}
            </Space>

            <Space>
              <Input
                placeholder="Add a topic"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                onPressEnter={handleAddTopic}
              />
              <Button
                type="primary"
                onClick={handleAddTopic}
                icon={<PlusOutlined />}
              >
                Add Topic
              </Button>
            </Space>
          </Card>
        </TabPane>

        <TabPane tab="Function Signatures" key="2">
          <Card>
            <Alert
              message="Function Signatures"
              description="Define how the function should be implemented in different programming languages. This must match the test cases you'll create."
              type="info"
              showIcon
              className="mb-4"
            />

            <Divider>Supported Languages</Divider>
            <div className="flex gap-6 mb-6">
              <div>
                <Space>
                  <Switch
                    checked={languageEnabled.java}
                    onChange={(checked) =>
                      handleSupportedLanguagesChange("java", checked)
                    }
                  />
                  <Text>Java</Text>
                </Space>
              </div>
              <div>
                <Space>
                  <Switch
                    checked={languageEnabled.python}
                    onChange={(checked) =>
                      handleSupportedLanguagesChange("python", checked)
                    }
                  />
                  <Text>Python</Text>
                </Space>
              </div>
              <div>
                <Space>
                  <Switch
                    checked={languageEnabled.javascript}
                    onChange={(checked) =>
                      handleSupportedLanguagesChange("javascript", checked)
                    }
                  />
                  <Text>JavaScript</Text>
                </Space>
              </div>
              <div>
                <Space>
                  <Switch
                    checked={languageEnabled.cpp}
                    onChange={(checked) =>
                      handleSupportedLanguagesChange("cpp", checked)
                    }
                  />
                  <Text>C++</Text>
                </Space>
              </div>
            </div>

            <Tabs type="card">
              <TabPane tab="Java" key="java" disabled={!languageEnabled.java}>
                <div className="mb-2">
                  <Title level={5}>Function Signature</Title>
                  <Form.Item
                    name="javaSignature"
                    rules={[
                      {
                        required: languageEnabled.java,
                        message: "Java signature is required",
                      },
                      { validator: validateFunctionSignature },
                    ]}
                  >
                    <TextArea
                      rows={6}
                      placeholder={JSON.stringify(
                        FUNCTION_TEMPLATES.java,
                        null,
                        2
                      )}
                    />
                  </Form.Item>
                  <Card className="bg-gray-50">
                    <Title level={5}>Example Implementation</Title>
                    <pre className="text-xs">{CODE_TEMPLATES.java}</pre>
                  </Card>
                </div>
              </TabPane>
              <TabPane
                tab="Python"
                key="python"
                disabled={!languageEnabled.python}
              >
                <div className="mb-2">
                  <Title level={5}>Function Signature</Title>
                  <Form.Item
                    name="pythonSignature"
                    rules={[
                      {
                        required: languageEnabled.python,
                        message: "Python signature is required",
                      },
                      { validator: validateFunctionSignature },
                    ]}
                  >
                    <TextArea
                      rows={6}
                      placeholder={JSON.stringify(
                        FUNCTION_TEMPLATES.python,
                        null,
                        2
                      )}
                    />
                  </Form.Item>
                  <Card className="bg-gray-50">
                    <Title level={5}>Example Implementation</Title>
                    <pre className="text-xs">{CODE_TEMPLATES.python}</pre>
                  </Card>
                </div>
              </TabPane>
              <TabPane
                tab="JavaScript"
                key="javascript"
                disabled={!languageEnabled.javascript}
              >
                <div className="mb-2">
                  <Title level={5}>Function Signature</Title>
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
                      placeholder={JSON.stringify(
                        FUNCTION_TEMPLATES.javascript,
                        null,
                        2
                      )}
                    />
                  </Form.Item>
                  <Card className="bg-gray-50">
                    <Title level={5}>Example Implementation</Title>
                    <pre className="text-xs">{CODE_TEMPLATES.javascript}</pre>
                  </Card>
                </div>
              </TabPane>
              <TabPane tab="C++" key="cpp" disabled={!languageEnabled.cpp}>
                <div className="mb-2">
                  <Title level={5}>Function Signature</Title>
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
                      placeholder={JSON.stringify(
                        FUNCTION_TEMPLATES.cpp,
                        null,
                        2
                      )}
                    />
                  </Form.Item>
                  <Card className="bg-gray-50">
                    <Title level={5}>Example Implementation</Title>
                    <pre className="text-xs">{CODE_TEMPLATES.cpp}</pre>
                  </Card>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </TabPane>

        <TabPane tab="Test Cases" key="3">
          <Card>
            <Alert
              message="Test Cases Definition"
              description="Define test cases to validate student solutions. Each test case includes input data, expected output, and other properties."
              type="info"
              showIcon
              className="mb-4"
            />

            <Form.List name="testCases">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      className="mb-4"
                      title={`Test Case #${name + 1}`}
                      extra={
                        fields.length > 1 ? (
                          <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          />
                        ) : null
                      }
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Form.Item
                            {...restField}
                            name={[name, "inputData"]}
                            label={
                              <Space>
                                <span>Input Data</span>
                                <Tooltip title="JSON string containing input data. Ex: [{'input':'[1,2,3]','dataType':'int[]'}]">
                                  <InfoCircleOutlined />
                                </Tooltip>
                              </Space>
                            }
                            rules={[
                              {
                                required: true,
                                message: "Input data is required",
                              },
                            ]}
                          >
                            <TextArea rows={4} />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "inputType"]}
                            label="Input Type"
                            rules={[{ required: true }]}
                          >
                            <Select>
                              <Option value="integer">Integer</Option>
                              <Option value="string">String</Option>
                              <Option value="array">Array</Option>
                              <Option value="object">Object</Option>
                            </Select>
                          </Form.Item>
                        </div>

                        <div>
                          <Form.Item
                            {...restField}
                            name={[name, "expectedOutputData"]}
                            label={
                              <Space>
                                <span>Expected Output</span>
                                <Tooltip title="JSON string containing expected output. Ex: {'expectedOutput':'6','dataType':'int'}">
                                  <InfoCircleOutlined />
                                </Tooltip>
                              </Space>
                            }
                            rules={[
                              {
                                required: true,
                                message: "Expected output is required",
                              },
                            ]}
                          >
                            <TextArea rows={4} />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "outputType"]}
                            label="Output Type"
                            rules={[{ required: true }]}
                          >
                            <Select>
                              <Option value="integer">Integer</Option>
                              <Option value="string">String</Option>
                              <Option value="array">Array</Option>
                              <Option value="object">Object</Option>
                            </Select>
                          </Form.Item>
                        </div>
                      </div>

                      <Form.Item
                        {...restField}
                        name={[name, "description"]}
                        label="Description"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="e.g., Test case with distinct numbers" />
                      </Form.Item>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                          {...restField}
                          name={[name, "isExample"]}
                          label="Show as Example"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "isHidden"]}
                          label="Hidden Test Case"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Form.Item
                          {...restField}
                          name={[name, "timeLimit"]}
                          label="Time Limit (ms)"
                          rules={[{ required: true }]}
                        >
                          <InputNumber
                            min={100}
                            max={5000}
                            className="w-full"
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "memoryLimit"]}
                          label="Memory Limit (KB)"
                          rules={[{ required: true }]}
                        >
                          <InputNumber
                            min={1024}
                            max={1048576}
                            className="w-full"
                          />
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "weight"]}
                          label="Weight"
                          rules={[{ required: true }]}
                        >
                          <InputNumber
                            min={0}
                            max={10}
                            step={0.1}
                            className="w-full"
                          />
                        </Form.Item>
                      </div>

                      <Form.Item
                        {...restField}
                        name={[name, "comparisonMode"]}
                        label="Comparison Mode"
                        rules={[{ required: true }]}
                      >
                        <Select>
                          <Option value="EXACT">Exact Match</Option>
                          <Option value="NUMERIC">
                            Numeric (with tolerance)
                          </Option>
                          <Option value="STRING_IGNORE_CASE">
                            String (Ignore Case)
                          </Option>
                        </Select>
                      </Form.Item>
                    </Card>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add(TEST_CASE_TEMPLATE)}
                      block
                      icon={<PlusOutlined />}
                    >
                      Add Test Case
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
          Previous
        </Button>

        <Space>
          {activeTab !== "3" ? (
            <Button
              type="primary"
              onClick={() => setActiveTab(String(Number(activeTab) + 1))}
            >
              Next
            </Button>
          ) : (
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<CodeOutlined />}
            >
              {initialValues ? "Update Problem" : "Create Problem"}
            </Button>
          )}
        </Space>
      </div>
    </Form>
  );
};

export default AdvancedProblemForm;
