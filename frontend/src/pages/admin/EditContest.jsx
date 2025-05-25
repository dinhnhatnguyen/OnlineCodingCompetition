import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Typography, Alert, Card } from "antd";
import ContestForm from "../../components/admin/ContestForm";
import { getContestById, updateContest } from "../../api/contestCrudApi";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const { Title, Paragraph } = Typography;

const EditContest = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchContest();
  }, [id]);

  const fetchContest = async () => {
    setFetching(true);
    try {
      const data = await getContestById(id);

      // Check if instructor is editing their own contest
      if (!isAdmin && data.createdById !== user?.id) {
        showError("Bạn không có quyền chỉnh sửa cuộc thi này");
        navigate("/admin/contests");
        return;
      }

      setContest(data);
    } catch (error) {
      console.error("Lỗi khi tải thông tin cuộc thi:", error);
      showError("Không thể tải thông tin cuộc thi");
      navigate("/admin/contests");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await updateContest(id, values, token);
      showSuccess("Đã cập nhật cuộc thi thành công");
      navigate("/admin/contests");
    } catch (error) {
      console.error("Lỗi khi cập nhật cuộc thi:", error);
      let errorMessage = "Không thể cập nhật cuộc thi";

      if (error.response?.data?.message) {
        errorMessage = `Lỗi: ${error.response.data.message}`;
      } else if (error.message) {
        errorMessage = `Lỗi: ${error.message}`;
      }

      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
        <div className="mt-4 text-center">Đang tải dữ liệu cuộc thi...</div>
      </div>
    );
  }

  return (
    <div>
      <Title level={2} className="mb-4">
        Chỉnh Sửa Cuộc Thi
      </Title>

      <Alert
        message="Cập nhật thông tin cuộc thi"
        description={
          <div>
            <Paragraph>Bạn có thể chỉnh sửa các thông tin sau:</Paragraph>
            <ul className="list-disc pl-6 mb-4">
              <li>Thông tin cơ bản (tiêu đề, mô tả)</li>
              <li>Thời gian diễn ra cuộc thi</li>
              <li>Trạng thái cuộc thi</li>
              <li>Danh sách các bài toán</li>
            </ul>
            <Paragraph>
              <strong>Lưu ý:</strong> Nếu cuộc thi đã bắt đầu, việc thay đổi có
              thể ảnh hưởng đến người dùng đang tham gia.
            </Paragraph>
          </div>
        }
        type="warning"
        showIcon
        className="mb-6"
      />

      {contest && (
        <Card>
          <ContestForm
            initialValues={contest}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </Card>
      )}
    </div>
  );
};

export default EditContest;
