import React, { useState } from "react";
import {
  Modal,
  Form,
  InputNumber,
  Switch,
  Select,
  Button,
  Space,
  Typography,
  Divider,
  Alert,
  Tooltip,
} from "antd";
import {
  InfoCircleOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Option } = Select;

const BulkEditModal = ({
  visible,
  onCancel,
  onOk,
  selectedCount,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [hasChanges, setHasChanges] = useState(false);

  const handleFormChange = () => {
    setHasChanges(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();

      // Only include fields that have been modified
      const updates = {};
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          updates[key] = values[key];
        }
      });

      if (Object.keys(updates).length === 0) {
        Modal.warning({
          title: "Không có thay đổi",
          content: "Vui lòng chọn ít nhất một thuộc tính để cập nhật.",
        });
        return;
      }

      await onOk(updates);
      form.resetFields();
      setHasChanges(false);
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Modal.confirm({
        title: "Xác nhận hủy",
        content:
          "Bạn có những thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy không?",
        okText: "Có, hủy bỏ",
        cancelText: "Tiếp tục chỉnh sửa",
        onOk: () => {
          form.resetFields();
          setHasChanges(false);
          onCancel();
        },
      });
    } else {
      onCancel();
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <EditOutlined className="text-blue-600" />
          <span>Chỉnh sửa hàng loạt Test Cases</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      width={600}
      className="bulk-edit-modal"
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={loading}>
          <CloseOutlined />
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleOk}
          icon={<SaveOutlined />}
        >
          Áp dụng thay đổi
        </Button>,
      ]}
    >
      <div className="space-y-4">
        <Alert
          message={`Đang chỉnh sửa ${selectedCount} test case${
            selectedCount > 1 ? "s" : ""
          }`}
          description="Chỉ những trường bạn điền sẽ được cập nhật. Các trường để trống sẽ giữ nguyên giá trị hiện tại."
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          className="mb-4"
        />

        <Form
          form={form}
          layout="vertical"
          onValuesChange={handleFormChange}
          className="space-y-4"
        >
          <Title level={5} className="mb-3">
            Giới hạn thời gian và bộ nhớ
          </Title>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="timeLimit"
              label={
                <span>
                  Giới hạn thời gian (ms)
                  <Tooltip title="Thời gian tối đa để thực thi test case (milliseconds)">
                    <InfoCircleOutlined className="ml-1 text-gray-500" />
                  </Tooltip>
                </span>
              }
            >
              <InputNumber
                min={100}
                max={30000}
                step={100}
                placeholder="Ví dụ: 1000"
                className="w-full"
                formatter={(value) => `${value}ms`}
                parser={(value) => value.replace("ms", "")}
              />
            </Form.Item>

            <Form.Item
              name="memoryLimit"
              label={
                <span>
                  Giới hạn bộ nhớ (KB)
                  <Tooltip title="Bộ nhớ tối đa cho phép sử dụng (kilobytes)">
                    <InfoCircleOutlined className="ml-1 text-gray-500" />
                  </Tooltip>
                </span>
              }
            >
              <InputNumber
                min={1024}
                max={1048576}
                step={1024}
                placeholder="Ví dụ: 262144"
                className="w-full"
                formatter={(value) => `${value}KB`}
                parser={(value) => value.replace("KB", "")}
              />
            </Form.Item>
          </div>

          <Divider />

          <Title level={5} className="mb-3">
            Điểm số và thuộc tính
          </Title>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="weight"
              label={
                <span>
                  Điểm số
                  <Tooltip title="Trọng số điểm của test case">
                    <InfoCircleOutlined className="ml-1 text-gray-500" />
                  </Tooltip>
                </span>
              }
            >
              <InputNumber
                min={0.1}
                max={100}
                step={0.1}
                placeholder="Ví dụ: 1.0"
                className="w-full"
              />
            </Form.Item>

            <Form.Item
              name="isExample"
              label={
                <span>
                  Loại test case
                  <Tooltip title="Test case ví dụ sẽ hiển thị cho người dùng">
                    <InfoCircleOutlined className="ml-1 text-gray-500" />
                  </Tooltip>
                </span>
              }
            >
              <Select
                placeholder="Chọn loại test case"
                allowClear
                className="w-full"
              >
                <Option value={true}>Test case ví dụ</Option>
                <Option value={false}>Test case thường</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="isHidden"
            label={
              <span>
                Trạng thái hiển thị
                <Tooltip title="Test case ẩn sẽ không hiển thị kết quả cho người dùng">
                  <InfoCircleOutlined className="ml-1 text-gray-500" />
                </Tooltip>
              </span>
            }
          >
            <Select
              placeholder="Chọn trạng thái hiển thị"
              allowClear
              className="w-full"
            >
              <Option value={false}>Hiển thị kết quả</Option>
              <Option value={true}>Ẩn kết quả</Option>
            </Select>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default BulkEditModal;
