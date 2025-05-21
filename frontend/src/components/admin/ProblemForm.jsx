import React, { useEffect } from "react";
import { Form, Input, Select, Button, Space, Card } from "antd";
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
      }}
    >
      <Card className="mb-4">
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

        <Form.Item
          name="difficulty"
          label="Difficulty"
          rules={[{ required: true, message: "Please select difficulty" }]}
        >
          <Select placeholder="Select difficulty">
            <Option value="EASY">Easy</Option>
            <Option value="MEDIUM">Medium</Option>
            <Option value="HARD">Hard</Option>
          </Select>
        </Form.Item>

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
          </Select>
        </Form.Item>
      </Card>

      <Card title="Test Cases" className="mb-4">
        <Form.List name="testCases">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline"
                >
                  <Form.Item
                    {...restField}
                    name={[name, "input"]}
                    rules={[{ required: true, message: "Missing input" }]}
                  >
                    <Input placeholder="Input" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "expectedOutput"]}
                    rules={[
                      { required: true, message: "Missing expected output" },
                    ]}
                  >
                    <Input placeholder="Expected Output" />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
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

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? "Update Problem" : "Create Problem"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProblemForm;
