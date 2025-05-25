import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Alert, Card } from "antd";
import ContestForm from "../../components/admin/ContestForm";
import { createContest } from "../../api/contestCrudApi";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const { Title, Paragraph } = Typography;

const CreateContest = () => {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await createContest(values, token);
      showSuccess("Đã tạo cuộc thi thành công");
      navigate("/admin/contests");
    } catch (error) {
      console.error("Lỗi khi tạo cuộc thi:", error);
      showError(error.response?.data?.message || "Không thể tạo cuộc thi");
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
            <Paragraph>Vui lòng điền đầy đủ các thông tin sau:</Paragraph>
            <ul className="list-disc pl-6 mb-4">
              <li>Thông tin cơ bản (tiêu đề, mô tả)</li>
              <li>Thời gian diễn ra cuộc thi</li>
              <li>Trạng thái cuộc thi</li>
              <li>Danh sách các bài toán</li>
            </ul>
            <Paragraph>
              <strong>Lưu ý:</strong> Sau khi tạo cuộc thi, bạn có thể chỉnh sửa
              thông tin này sau.
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
