import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message, Form, Input, Select, Button, Card, Space } from "antd";
import { getProblemById, updateProblem } from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";

const { TextArea } = Input;
const { Option } = Select;

const EditProblem = () => {
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const problem = await getProblemById(id);
        setInitialValues(problem);
        form.setFieldsValue({
          title: problem.title,
          description: problem.description,
          difficulty: problem.difficulty,
          topics: problem.topics || [],
          constraints: problem.constraints,
        });
      } catch (err) {
        console.error("Error fetching problem:", err);
        message.error(
          err.response?.data?.message || "Failed to fetch problem details"
        );
        navigate("/admin/problems");
      }
    };

    fetchProblem();
  }, [id, navigate, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      // Chỉ cập nhật các thông tin cơ bản, giữ nguyên test cases và function signatures
      const updateData = {
        ...initialValues,
        title: values.title,
        description: values.description,
        difficulty: values.difficulty,
        topics: values.topics,
        constraints: values.constraints,
      };

      await updateProblem(id, updateData, token);
      message.success("Problem updated successfully");
      navigate("/admin/problems");
    } catch (err) {
      console.error("Error updating problem:", err);
      message.error(err.response?.data?.message || "Failed to update problem");
    } finally {
      setLoading(false);
    }
  };

  if (!initialValues) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Edit Basic Problem Information
      </h1>
      <p className="text-gray-500 mb-4">
        Use this form to edit basic information of the problem. For advanced
        edits like test cases and function signatures, please use the Advanced
        Edit option.
      </p>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
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

          <Form.Item name="topics" label="Topics">
            <Select
              mode="tags"
              placeholder="Add problem topics (e.g., Arrays, Dynamic Programming)"
            >
              <Option value="Arrays">Arrays</Option>
              <Option value="Strings">Strings</Option>
              <Option value="Dynamic Programming">Dynamic Programming</Option>
              <Option value="math">Math</Option>
              <Option value="basic">Basic</Option>
              <Option value="algorithm">Algorithm</Option>
              <Option value="Data Structures">Data Structures</Option>
              <Option value="hash table">Hash Table</Option>
            </Select>
          </Form.Item>

          <Form.Item name="constraints" label="Constraints">
            <TextArea rows={3} placeholder="Enter problem constraints" />
          </Form.Item>
        </Card>

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Problem
          </Button>
          <Button onClick={() => navigate("/admin/problems")}>Cancel</Button>
        </Space>
      </Form>
    </div>
  );
};

export default EditProblem;
