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
  Space,
} from "antd";
import { getProblems } from "../../api/problemApi";
import { getAvailableProblemsForContest } from "../../api/contestCrudApi";
import { useAuth } from "../../contexts/AuthContext";
import moment from "moment";

const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ContestForm = ({ initialValues, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [problems, setProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const { token } = useAuth();
  const isEditing = !!initialValues;

  useEffect(() => {
    if (isEditing && initialValues?.id) {
      fetchAvailableProblems(initialValues.id);
    } else {
      fetchProblems();
    }
  }, [initialValues]);

  useEffect(() => {
    if (initialValues) {
      const formValues = {
        ...initialValues,
        dateRange:
          initialValues.startTime && initialValues.endTime
            ? [moment(initialValues.startTime), moment(initialValues.endTime)]
            : undefined,
        isPublic: initialValues.public,
      };
      form.setFieldsValue(formValues);
    }
  }, [initialValues, form]);

  const fetchProblems = async () => {
    setLoadingProblems(true);
    try {
      const data = await getProblems();
      setProblems(data);
    } catch (error) {
      console.error("Error fetching problems:", error);
    } finally {
      setLoadingProblems(false);
    }
  };

  const fetchAvailableProblems = async (contestId) => {
    setLoadingProblems(true);
    try {
      const data = await getAvailableProblemsForContest(contestId, token);
      setProblems(data);
    } catch (error) {
      console.error("Error fetching available problems:", error);
    } finally {
      setLoadingProblems(false);
    }
  };

  const handleStatusChange = (value) => {
    // Không cần tự động chuyển đổi trạng thái ở frontend nữa
    form.setFieldValue("status", value);
  };

  const handleSubmit = async (values) => {
    const [startTime, endTime] = values.dateRange;

    // Format dữ liệu trước khi gửi
    const { dateRange, isPublic, ...otherValues } = values;
    const formattedData = {
      ...otherValues,
      startTime: startTime.format("YYYY-MM-DDTHH:mm:ss"),
      endTime: endTime.format("YYYY-MM-DDTHH:mm:ss"),
      public: isPublic,
    };

    onSubmit(formattedData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        maxParticipants: 100,
        isPublic: true,
        status: "DRAFT",
      }}
    >
      <Card title="Thông tin cơ bản" className="mb-4">
        <Form.Item
          name="title"
          label="Tên cuộc thi"
          rules={[{ required: true, message: "Vui lòng nhập tên cuộc thi" }]}
        >
          <Input placeholder="Nhập tên cuộc thi" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Vui lòng nhập mô tả cuộc thi" }]}
        >
          <TextArea rows={4} placeholder="Nhập mô tả cuộc thi" />
        </Form.Item>

        <Form.Item
          name="dateRange"
          label="Thời gian"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn thời gian bắt đầu và kết thúc",
            },
          ]}
        >
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            className="w-full"
          />
        </Form.Item>
      </Card>

      <Card title="Cài đặt cuộc thi" className="mb-4">
        <Space direction="vertical" className="w-full">
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
          >
            <Select placeholder="Chọn trạng thái" onChange={handleStatusChange}>
              <Option value="DRAFT">Nháp</Option>
              <Option value="READY">Sẵn sàng tổ chức</Option>
              <Option value="CANCELLED">Huỷ</Option>
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
          tooltip="Cuộc thi công khai cho phép mọi người tham gia mà không cần đăng ký"
        >
          <Switch />
        </Form.Item>
      </Card>

      <Card title="Bài tập" className="mb-4">
        <Form.Item name="problemIds" label="Danh sách bài tập">
          <Select
            mode="multiple"
            placeholder="Chọn bài tập"
            loading={loadingProblems}
            className="w-full"
          >
            {problems.map((problem) => (
              <Option key={problem.id} value={problem.id}>
                {problem.title}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Card>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          {isEditing ? "Cập nhật cuộc thi" : "Tạo cuộc thi"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ContestForm;
