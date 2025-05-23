import React from "react";
import { Card, Button, Typography, Space } from "antd";
import { Link } from "react-router-dom";
import { LockOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

const ForgotPasswordPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-lg mx-auto text-center">
        <LockOutlined style={{ fontSize: 64, color: "#1890ff" }} />
        <Title level={2} className="mt-4">
          Quên mật khẩu?
        </Title>
        <Paragraph className="mb-6">
          Nếu bạn đã quên mật khẩu, hãy click vào nút bên dưới để đặt lại mật
          khẩu. Bạn sẽ cần xác minh thông qua CAPTCHA trước khi đặt mật khẩu
          mới.
        </Paragraph>
        <Space direction="vertical" size="middle" className="w-full">
          <Link to="/reset-password">
            <Button type="primary" size="large" block>
              Đặt lại mật khẩu
            </Button>
          </Link>
          <Link to="/login">
            <Button type="link">Quay lại đăng nhập</Button>
          </Link>
        </Space>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
