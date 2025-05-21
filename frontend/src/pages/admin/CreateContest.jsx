import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Typography, Alert, Card } from "antd";
import ContestForm from "../../components/admin/ContestForm";
import { createContest } from "../../api/contestCrudApi";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Paragraph } = Typography;

const CreateContest = () => {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await createContest(values, token);
      message.success("Đã tạo cuộc thi thành công");
      navigate("/admin/contests");
    } catch (error) {
      console.error("Lỗi khi tạo cuộc thi:", error);
      message.error(error.response?.data?.message || "Không thể tạo cuộc thi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2} className="mb-4">
        Tạo Cuộc Thi Mới
      </Title>

      <Alert
        message="Hướng dẫn tạo cuộc thi"
        description={
          <div>
            <Paragraph>Tạo cuộc thi mới bao gồm 3 bước chính:</Paragraph>
            <ul className="list-disc pl-6 mb-4">
              <li>
                Nhập thông tin cơ bản về cuộc thi (tiêu đề, mô tả, thời gian)
              </li>
              <li>
                Cài đặt các thông số như trạng thái, số lượng người tham gia
              </li>
              <li>Chọn các bài toán sẽ xuất hiện trong cuộc thi</li>
            </ul>
            <Paragraph>
              <strong>Lưu ý:</strong> Bạn cần tạo các bài toán trước khi có thể
              thêm chúng vào cuộc thi.
            </Paragraph>
          </div>
        }
        type="info"
        showIcon
        className="mb-6"
      />

      <Card>
        <ContestForm onSubmit={handleSubmit} loading={loading} />
      </Card>
    </div>
  );
};

export default CreateContest;
