import React, { useState } from "react";
import { Card, Form, Input, Button, message, Alert, Space } from "antd";
import {
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { resetPassword } from "../../api/userApi";
import { useNavigate, Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

const ResetPasswordPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  const onCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (values) => {
    // Validate password confirmation
    if (values.newPassword !== values.confirmPassword) {
      message.error("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    // Check if captcha is completed
    if (!captchaToken) {
      message.error("Vui lòng xác nhận captcha");
      return;
    }

    const resetData = {
      email: values.email,
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword,
      captchaToken: captchaToken,
    };

    setLoading(true);
    try {
      await resetPassword(resetData);
      message.success("Đặt lại mật khẩu thành công");
      setResetSuccess(true);
      // Tự động chuyển hướng sau 3 giây
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      if (error.response?.status === 400) {
        message.error(
          error.response.data.message || "Đặt lại mật khẩu thất bại"
        );
      } else {
        message.error("Đặt lại mật khẩu thất bại. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Đặt lại mật khẩu</h1>

      <Card className="max-w-2xl mx-auto">
        {resetSuccess ? (
          <div className="text-center py-8">
            <div className="text-6xl text-green-500 mb-4">✓</div>
            <h2 className="text-xl font-bold mb-2">
              Đặt lại mật khẩu thành công!
            </h2>
            <p className="mb-6">
              Bạn sẽ được chuyển hướng đến trang đăng nhập sau vài giây...
            </p>
            <Link to="/login">
              <Button type="primary">Đến trang đăng nhập ngay</Button>
            </Link>
          </div>
        ) : (
          <>
            <Alert
              message="Lưu ý"
              description="Nếu bạn quên mật khẩu, vui lòng nhập email đã đăng ký và mật khẩu mới. Sau khi xác nhận captcha, mật khẩu của bạn sẽ được đặt lại."
              type="info"
              showIcon
              className="mb-6"
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              className="p-2"
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email",
                  },
                  {
                    type: "email",
                    message: "Email không hợp lệ",
                  },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email đã đăng ký"
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

              <Form.Item
                label="Xác minh captcha"
                required
                className="flex justify-center"
              >
                <ReCAPTCHA
                  sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                  onChange={onCaptchaChange}
                />
              </Form.Item>

              <Form.Item>
                <Space direction="vertical" className="w-full">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                  >
                    Đặt lại mật khẩu
                  </Button>
                  <div className="text-center mt-2">
                    <Link
                      to="/login"
                      className="text-primary-pink hover:underline"
                    >
                      <ArrowLeftOutlined /> Quay lại đăng nhập
                    </Link>
                  </div>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
