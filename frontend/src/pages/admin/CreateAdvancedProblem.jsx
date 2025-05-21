import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Typography, Steps, Card, Alert, Space, Divider } from "antd";
import AdvancedProblemForm from "../../components/admin/AdvancedProblemForm";
import { createProblemWithTestCases } from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const CreateAdvancedProblem = () => {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await createProblemWithTestCases(values, token);
      message.success("Bài toán đã được tạo thành công!");
      navigate("/admin/problems");
    } catch (error) {
      console.error("Error creating problem:", error);
      message.error(`Lỗi khi tạo bài toán: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Title level={2} className="mb-4">
        Tạo Bài Toán Mới
      </Title>

      <Alert
        message="Hướng dẫn tạo bài toán"
        description={
          <div>
            <p>
              Hệ thống này cho phép bạn tạo các bài toán lập trình với nhiều
              tính năng nâng cao. Quy trình gồm 3 bước:
            </p>

            <Steps
              current={-1}
              direction="horizontal"
              className="my-6"
              items={[
                {
                  title: "Thông tin cơ bản",
                  description: "Tiêu đề, mô tả, độ khó",
                },
                {
                  title: "Chữ ký hàm",
                  description: "Định nghĩa chữ ký hàm cho các ngôn ngữ",
                },
                {
                  title: "Test Cases",
                  description: "Tạo và cấu hình test cases",
                },
              ]}
            />

            <Divider />

            <Title level={4}>Lưu ý quan trọng</Title>
            <ul className="list-disc pl-8 mt-2">
              <li>
                <Text strong>Kiểu dữ liệu:</Text> Hệ thống hỗ trợ nhiều kiểu dữ
                liệu khác nhau như số nguyên, số thực, chuỗi, mảng và đối tượng.
                Mỗi ngôn ngữ có thể có cách biểu diễn khác nhau.
              </li>
              <li>
                <Text strong>Chữ ký hàm:</Text> Định nghĩa chính xác chữ ký hàm
                cho từng ngôn ngữ. Người dùng sẽ phải triển khai các hàm này.
              </li>
              <li>
                <Text strong>Test Cases:</Text> Mỗi test case cần có đầu vào,
                đầu ra và các thông số cấu hình. Test cases trọng tâm nên được
                gắn trọng số cao hơn.
              </li>
              <li>
                <Text strong>Nhiều ngôn ngữ:</Text> Bạn có thể hỗ trợ nhiều ngôn
                ngữ lập trình (Java, Python, JavaScript, C++) cho cùng một bài
                toán.
              </li>
            </ul>

            <Space direction="vertical" className="mt-4" size="middle">
              <Text strong>
                Hãy chắc chắn kiểm tra kỹ chữ ký hàm và test cases trước khi tạo
                bài toán!
              </Text>
            </Space>
          </div>
        }
        type="info"
        showIcon
        className="mb-6"
      />

      <Card>
        <AdvancedProblemForm onSubmit={handleSubmit} loading={loading} />
      </Card>
    </div>
  );
};

export default CreateAdvancedProblem;
