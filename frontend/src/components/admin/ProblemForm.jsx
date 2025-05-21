import React, { useEffect } from "react";
import { Form, Input, Select, Button, Space, Card, Divider, Tag } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const ProblemForm = ({ initialValues, onSubmit, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    await onSubmit(values);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        allowedLanguages: ["java", "python"],
        testCases: [{ input: "", expectedOutput: "" }],
        difficulty: "MEDIUM",
        timeLimit: 1000, // 1 second default
        memoryLimit: 64, // 64MB default
        topics: [],
      }}
    >
      <Card title="Basic Information" className="mb-4">
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Please enter problem title" }]}
        >
          <Input placeholder="Enter problem title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: "Please enter problem description" },
          ]}
        >
          <TextArea rows={4} placeholder="Enter problem description" />
        </Form.Item>

        <Space className="w-full">
          <Form.Item
            name="difficulty"
            label="Difficulty"
            rules={[{ required: true, message: "Please select difficulty" }]}
            className="w-full"
          >
            <Select placeholder="Select difficulty">
              <Option value="EASY">Easy</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="HARD">Hard</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="timeLimit"
            label="Time Limit (ms)"
            rules={[{ required: true, message: "Please enter time limit" }]}
            className="w-full"
          >
            <Input
              type="number"
              min={100}
              placeholder="Time limit in milliseconds"
            />
          </Form.Item>

          <Form.Item
            name="memoryLimit"
            label="Memory Limit (MB)"
            rules={[{ required: true, message: "Please enter memory limit" }]}
            className="w-full"
          >
            <Input type="number" min={16} placeholder="Memory limit in MB" />
          </Form.Item>
        </Space>

        <Form.Item name="topics" label="Topics">
          <Select
            mode="tags"
            placeholder="Add problem topics (e.g., Arrays, Dynamic Programming)"
          >
            <Option value="Arrays">Arrays</Option>
            <Option value="Strings">Strings</Option>
            <Option value="Dynamic Programming">Dynamic Programming</Option>
            <Option value="Data Structures">Data Structures</Option>
            <Option value="Algorithms">Algorithms</Option>
            <Option value="Recursion">Recursion</Option>
            <Option value="Sorting">Sorting</Option>
            <Option value="Searching">Searching</Option>
            <Option value="Graph">Graph</Option>
            <Option value="Tree">Tree</Option>
          </Select>
        </Form.Item>
      </Card>

      <Card title="Solution Details" className="mb-4">
        <Form.Item
          name="functionSignature"
          label="Function Signature"
          rules={[
            { required: true, message: "Please enter function signature" },
          ]}
        >
          <Input placeholder="e.g., public int[] twoSum(int[] nums, int target)" />
        </Form.Item>

        <Form.Item
          name="allowedLanguages"
          label="Allowed Languages"
          rules={[
            { required: true, message: "Please select allowed languages" },
          ]}
        >
          <Select mode="multiple" placeholder="Select allowed languages">
            <Option value="java">Java</Option>
            <Option value="python">Python</Option>
            <Option value="cpp">C++</Option>
            <Option value="javascript">JavaScript</Option>
          </Select>
        </Form.Item>

        <Form.Item name="solutionTemplate" label="Solution Template (Optional)">
          <TextArea
            rows={6}
            placeholder="Provide a starter template for solution (optional)"
          />
        </Form.Item>
      </Card>

      <Card title="Test Cases" className="mb-4">
        <Form.List name="testCases">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card key={key} className="mb-2" size="small">
                  <Space
                    direction="vertical"
                    style={{ display: "flex", width: "100%" }}
                    className="mb-2"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "input"]}
                      label="Input"
                      rules={[{ required: true, message: "Missing input" }]}
                    >
                      <TextArea rows={2} placeholder="Input" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "expectedOutput"]}
                      label="Expected Output"
                      rules={[
                        { required: true, message: "Missing expected output" },
                      ]}
                    >
                      <TextArea rows={2} placeholder="Expected Output" />
                    </Form.Item>
                    <Button
                      danger
                      onClick={() => remove(name)}
                      disabled={fields.length === 1}
                      icon={<MinusCircleOutlined />}
                    >
                      Remove Test Case
                    </Button>
                  </Space>
                </Card>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => add()}
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

      <Divider />

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? "Update Problem" : "Create Problem"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProblemForm;
