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
import { useToast } from "../../contexts/ToastContext";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const TestCaseManagerPage = () => {
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showSuccess, showError, showInfo } = useToast();

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

  const handleSave = async () => {
    try {
      setSubmitting(true);
      await updateProblemWithTestCases(
        id,
        {
          createProblem: problem,
          createTestCases: testCases,
        },
        token
      );
      showSuccess("Test cases đã được cập nhật thành công!");
    } catch (error) {
      console.error("Error saving test cases:", error);
      let errorMessage = "Không thể cập nhật test cases";

      if (error.response?.status === 403) {
        errorMessage = "Bạn không có quyền cập nhật test cases";
      } else if (error.response?.status === 404) {
        errorMessage = "Không tìm thấy bài toán để cập nhật test cases";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddTestCase = () => {
    const newTestCase = {
      id: Date.now(),
      inputData: "",
      expectedOutputData: "",
      isExample: false,
      isHidden: false,
      timeLimit: problem.defaultTimeLimit || 1000,
      memoryLimit: problem.defaultMemoryLimit || 262144,
      weight: 1,
      testOrder: testCases.length + 1,
    };
    setTestCases([...testCases, newTestCase]);
    showInfo("Đã thêm test case mới");
  };

  const handleDeleteTestCase = (index) => {
    const updatedTestCases = testCases.filter((_, i) => i !== index);
    setTestCases(updatedTestCases);
    showInfo("Đã xóa test case");
  };

  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[index] = {
      ...updatedTestCases[index],
      [field]: value,
    };
    setTestCases(updatedTestCases);
    showInfo(`Đã cập nhật ${field} của test case ${index + 1}`);
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
