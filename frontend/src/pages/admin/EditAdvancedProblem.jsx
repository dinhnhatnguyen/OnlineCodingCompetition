import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  message,
  Typography,
  Skeleton,
  Alert,
  Card,
  Result,
  Space,
  Button,
} from "antd";
import AdvancedProblemForm from "../../components/admin/AdvancedProblemForm";
import {
  getProblemById,
  updateProblemWithTestCases,
} from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;

const EditAdvancedProblem = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const problemData = await getProblemById(id, token);
        console.log("Problem data fetched:", problemData);
        setProblem(problemData);
        setError(null);
      } catch (err) {
        console.error("Error fetching problem:", err);
        setError(`Không thể tải thông tin bài toán: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, token]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      console.log("Updating problem with values:", values);
      await updateProblemWithTestCases(id, values, token);
      message.success("Cập nhật bài toán thành công!");
      navigate("/admin/problems");
    } catch (err) {
      console.error("Error updating problem:", err);
      let errorMessage = `Lỗi khi cập nhật bài toán`;

      if (err.response?.data?.message) {
        errorMessage += `: ${err.response.data.message}`;
      } else if (err.message) {
        errorMessage += `: ${err.message}`;
      }

      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="my-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </Card>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Lỗi tải dữ liệu"
        subTitle={error}
        extra={
          <Button type="primary" onClick={() => navigate("/admin/problems")}>
            Quay lại danh sách bài tập
          </Button>
        }
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>Chỉnh sửa bài toán</Title>
        <Button onClick={() => navigate("/admin/problems")}>
          Quay lại danh sách
        </Button>
      </div>

      <Alert
        message="Hướng dẫn chỉnh sửa bài toán"
        description={
          <div>
            <p>
              Bạn có thể thêm, xóa và chỉnh sửa các test case của bài toán. Lưu
              ý rằng:
            </p>
            <ul className="list-disc pl-8 mt-2">
              <li>
                Các test case hiện tại của bài toán đã được tải và sẵn sàng để
                chỉnh sửa
              </li>
              <li>
                Bạn có thể thêm test case mới bằng cách nhấn nút "Thêm Test
                Case"
              </li>
              <li>
                Việc xóa hoặc thay đổi test case hiện tại có thể ảnh hưởng đến
                các bài nộp đã có
              </li>
              <li>Đảm bảo kiểm tra cẩn thận trước khi lưu thay đổi</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        className="mb-6"
      />

      {problem ? (
        <AdvancedProblemForm
          onSubmit={handleSubmit}
          loading={submitting}
          initialValues={problem}
        />
      ) : (
        <Alert
          message="Không tìm thấy bài toán"
          description="Không thể tải thông tin bài toán. Vui lòng thử lại hoặc kiểm tra ID bài toán."
          type="error"
          showIcon
        />
      )}
    </div>
  );
};

export default EditAdvancedProblem;
