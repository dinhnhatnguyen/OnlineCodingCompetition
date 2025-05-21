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
      console.error("Lỗi khi tải danh sách bài toán:", error);
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

    // Ensure problemIds is correctly formatted as an array of numbers
    if (contestData.problemIds && Array.isArray(contestData.problemIds)) {
      contestData.problemIds = contestData.problemIds.map((id) =>
        typeof id === "string" ? parseInt(id, 10) : id
      );
    }

    // Convert numeric values to proper types
    if (contestData.maxParticipants) {
      contestData.maxParticipants = parseInt(contestData.maxParticipants, 10);
    }

    // Ensure boolean values are properly formatted
    contestData.isPublic = Boolean(contestData.isPublic);

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
      <Card title="Thông tin cuộc thi" className="mb-4">
        <Form.Item
          name="title"
          label="Tiêu đề cuộc thi"
          rules={[
            { required: true, message: "Vui lòng nhập tiêu đề cuộc thi" },
          ]}
        >
          <Input placeholder="Nhập tiêu đề cuộc thi" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Vui lòng nhập mô tả cuộc thi" }]}
        >
          <TextArea rows={4} placeholder="Mô tả chi tiết về cuộc thi" />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Thời gian diễn ra"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn thời gian diễn ra cuộc thi",
            },
          ]}
        >
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            className="w-full"
            placeholder={["Thời gian bắt đầu", "Thời gian kết thúc"]}
          />
        </Form.Item>

        <Space className="w-full">
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            className="w-full"
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="DRAFT">Nháp</Option>
              <Option value="UPCOMING">Sắp diễn ra</Option>
              <Option value="ONGOING">Đang diễn ra</Option>
              <Option value="COMPLETED">Đã kết thúc</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="maxParticipants"
            label="Số người tham gia tối đa"
            className="w-full"
          >
            <InputNumber
              min={1}
              placeholder="Không giới hạn nếu bỏ trống"
              className="w-full"
            />
          </Form.Item>
        </Space>

        <Form.Item
          name="isPublic"
          label="Cuộc thi công khai"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Card>

      <Card title="Bài toán trong cuộc thi" className="mb-4">
        {problems.length === 0 && !loadingProblems ? (
          <Alert
            message="Không có bài toán nào"
            description="Bạn cần tạo các bài toán trước khi thêm vào cuộc thi."
            type="info"
            className="mb-4"
          />
        ) : null}

        <Form.Item
          name="problemIds"
          label="Chọn bài toán"
          rules={[
            { required: true, message: "Vui lòng chọn ít nhất một bài toán" },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn các bài toán cho cuộc thi này"
            loading={loadingProblems}
            className="w-full"
            optionFilterProp="children"
          >
            {problems.map((problem) => (
              <Option key={problem.id} value={problem.id}>
                {problem.title} (
                {problem.difficulty === "EASY"
                  ? "Dễ"
                  : problem.difficulty === "MEDIUM"
                  ? "Trung bình"
                  : "Khó"}
                )
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Card>

      <Divider />

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? "Cập nhật cuộc thi" : "Tạo cuộc thi"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ContestForm;
