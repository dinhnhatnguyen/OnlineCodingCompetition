import React, { useState, useEffect } from "react";
import { Card, Form, Input, Button, message, Spin } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import { getUserProfile, updateProfile } from "../../api/userApi";
import { useAuth } from "../../contexts/AuthContext";

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { token, updateUser } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profileData = await getUserProfile(token);
        form.setFieldsValue({
          username: profileData.username,
          email: profileData.email,
        });
      } catch (error) {
        message.error("Không thể tải thông tin hồ sơ");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token, form]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const updatedProfile = await updateProfile(values, token);
      message.success("Cập nhật hồ sơ thành công");

      // Update the user information in auth context if necessary
      if (updateUser) {
        updateUser({
          username: updatedProfile.username,
          email: updatedProfile.email,
        });
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Cập nhật hồ sơ thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Hồ sơ cá nhân</h1>

      <Card className="max-w-2xl mx-auto">
        {loading ? (
          <div className="flex justify-center p-6">
            <Spin size="large" />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className="p-2"
          >
            <Form.Item
              name="username"
              label="Tên người dùng"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên người dùng",
                },
                {
                  max: 20,
                  message: "Tên người dùng không được vượt quá 20 ký tự",
                },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Tên người dùng" />
            </Form.Item>

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
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                block
              >
                Cập nhật hồ sơ
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;
