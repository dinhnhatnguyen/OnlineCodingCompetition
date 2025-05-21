import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  InputNumber,
  Switch,
  Card,
  Divider,
  Space,
  Alert,
} from "antd";
import { getProblems } from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";
import moment from "moment";

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ContestForm = ({ initialValues, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchProblems();
  }, []);

  useEffect(() => {
    if (initialValues) {
      // Format the dates for form
      const formattedValues = {
        ...initialValues,
        dateRange:
          initialValues.startTime && initialValues.endTime
            ? [moment(initialValues.startTime), moment(initialValues.endTime)]
            : undefined,
      };
      form.setFieldsValue(formattedValues);
    }
  }, [initialValues, form]);

  const fetchProblems = async () => {
    setLoadingProblems(true);
    try {
      const data = await getProblems();
      // Filter problems for instructors (only show their own)
      const filteredProblems = isAdmin
        ? data
        : data.filter((problem) => problem.createdById === user?.id);

      setProblems(filteredProblems);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleSubmit = (values) => {
    // Extract start and end times from the date range
    const [startTime, endTime] = values.dateRange || [];

    const contestData = {
      ...values,
      startTime: startTime ? startTime.format() : undefined,
      endTime: endTime ? endTime.format() : undefined,
    };

    // Remove the dateRange field
    delete contestData.dateRange;

    onSubmit(contestData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        isPublic: true,
        status: "DRAFT",
        problemIds: [],
      }}
    >
      <Card title="Basic Information" className="mb-4">
        <Form.Item
          name="title"
          label="Contest Title"
          rules={[
            { required: true, message: "Please enter the contest title" },
          ]}
        >
          <Input placeholder="Enter contest title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <TextArea rows={4} placeholder="Describe the contest" />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Contest Duration"
          rules={[
            { required: true, message: "Please select the contest duration" },
          ]}
        >
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            className="w-full"
          />
        </Form.Item>

        <Space className="w-full">
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
            className="w-full"
          >
            <Select placeholder="Select status">
              <Option value="DRAFT">Draft</Option>
              <Option value="UPCOMING">Upcoming</Option>
              <Option value="ONGOING">Ongoing</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="maxParticipants"
            label="Max Participants"
            className="w-full"
          >
            <InputNumber
              min={1}
              placeholder="Unlimited if empty"
              className="w-full"
            />
          </Form.Item>
        </Space>

        <Form.Item
          name="isPublic"
          label="Public Contest"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Card>

      <Card title="Problems" className="mb-4">
        {problems.length === 0 && !loadingProblems ? (
          <Alert
            message="No problems available"
            description="You need to create problems before you can add them to a contest."
            type="info"
            className="mb-4"
          />
        ) : null}

        <Form.Item
          name="problemIds"
          label="Select Problems"
          rules={[
            { required: true, message: "Please select at least one problem" },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select problems for this contest"
            loading={loadingProblems}
            className="w-full"
            optionFilterProp="children"
          >
            {problems.map((problem) => (
              <Option key={problem.id} value={problem.id}>
                {problem.title} ({problem.difficulty})
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Card>

      <Divider />

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? "Update Contest" : "Create Contest"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ContestForm;
