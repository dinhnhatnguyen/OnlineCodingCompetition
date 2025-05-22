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
  Tabs,
} from "antd";
import TestCaseManager from "../../components/admin/TestCaseManager";
import { getProblemById } from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TestCaseManagerPage = () => {
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const problemData = await getProblemById(id);
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
  }, [id]);

  const handleTestCasesChanged = () => {
    message.success("Test cases cập nhật thành công!");
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
        <div>
          <Title level={2}>Quản lý Test Cases</Title>
          <Text type="secondary">
            Bài toán: {problem?.title || "Không xác định"}
          </Text>
        </div>
        <Space>
          <Button onClick={() => navigate(`/admin/problems/edit/${id}`)}>
            Chỉnh sửa bài toán
          </Button>
          <Button onClick={() => navigate("/admin/problems")}>
            Quay lại danh sách
          </Button>
        </Space>
      </div>

      <Alert
        message="Hướng dẫn quản lý test case"
        description={
          <div>
            <p>Tại đây bạn có thể quản lý các test case của bài toán:</p>
            <ul className="list-disc pl-8 mt-2">
              <li>
                <strong>Thêm test case:</strong> Nhấn nút "Thêm Test Case" để
                tạo mới
              </li>
              <li>
                <strong>Chỉnh sửa test case:</strong> Nhấn "Sửa" để chỉnh sửa
                thông tin test case
              </li>
              <li>
                <strong>Xóa test case:</strong> Nhấn "Xóa" để xóa một test case
                (hãy thận trọng!)
              </li>
              <li>
                <strong>Sao chép test case:</strong> Nhấn "Sao chép" để tạo bản
                sao của test case hiện có
              </li>
            </ul>
          </div>
        }
        type="info"
        showIcon
        className="mb-6"
      />

      {problem ? (
        <Card>
          <TestCaseManager
            problemId={id}
            token={token}
            onTestCasesChanged={handleTestCasesChanged}
          />
        </Card>
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

export default TestCaseManagerPage;
