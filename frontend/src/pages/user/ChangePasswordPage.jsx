import React, { useState } from "react";
import { Card, Form, Input, Button } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { changePassword } from "../../api/userApi";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../contexts/ToastContext";

const ChangePasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (values) => {
    // Validate password confirmation
    if (values.newPassword !== values.confirmPassword) {
      showError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      await changePassword(values, token);
      showSuccess(
        "Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới trong lần đăng nhập tới."
      );
      form.resetFields();
      // Redirect to home page after successful password change
      navigate("/");
    } catch (error) {
      if (error.response?.status === 400) {
        showError(error.response.data.message || "Đặt lại mật khẩu thất bại");
      } else {
        showError("Đặt lại mật khẩu thất bại. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Đổi mật khẩu</h1>

      <Card className="max-w-2xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="p-2"
        >
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu hiện tại",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu hiện tại"
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu mới",
              },
              {
                min: 6,
                message: "Mật khẩu phải có ít nhất 6 ký tự",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Mật khẩu mới"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={["newPassword"]}
            rules={[
              {
                required: true,
                message: "Vui lòng xác nhận mật khẩu mới",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu mới"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
