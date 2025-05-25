import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message, Typography, Steps, Card, Alert, Space, Divider } from "antd";
import AdvancedProblemForm from "../../components/admin/AdvancedProblemForm";
import { createProblemWithTestCases } from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const CreateAdvancedProblem = () => {
  const [submitting, setSubmitting] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const result = await createProblemWithTestCases(values, token);
      showSuccess("Bài toán đã được tạo thành công!");
      navigate(`/admin/problems/testcases/${result.id}`);
    } catch (error) {
      console.error("Error creating problem:", error);
      let errorMessage = "Không thể tạo bài toán";

      if (error.response?.status === 403) {
        errorMessage = "Bạn không có quyền tạo bài toán";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTestCaseChange = (testCases) => {
    setTestCases(testCases);
    showInfo(`Đã cập nhật ${testCases.length} test case`);
  };

  const handleAddTestCase = () => {
    const newTestCase = {
      id: Date.now(),
      inputData: "",
      expectedOutputData: "",
      isExample: false,
      isHidden: false,
      timeLimit: 1000,
      memoryLimit: 262144,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Title level={2}>Tạo bài toán mới</Title>
        <Text type="secondary">
          Tạo bài toán mới với đầy đủ thông tin cơ bản, function signatures và
          test cases.
        </Text>
      </div>

      <Alert
        message="Hướng dẫn"
        description={
          <div>
            <p>Để tạo một bài toán hoàn chỉnh, bạn cần:</p>
            <ol className="list-decimal pl-8 mt-2">
              <li>Điền đầy đủ thông tin cơ bản về bài toán</li>
              <li>
                Định nghĩa function signatures cho các ngôn ngữ được hỗ trợ
              </li>
              <li>Tạo các test cases để kiểm tra bài làm của học viên</li>
            </ol>
          </div>
        }
        type="info"
        showIcon
        className="mb-6"
      />

      <Alert
        message="Hướng dẫn định nghĩa Function Signature"
        description={
          <div>
            <p>
              Khi định nghĩa Function Signature, cần tuân thủ định dạng JSON với
              cú pháp đúng:
            </p>
            <pre className="bg-gray-100 p-2 rounded text-sm my-2">
              {`{
  "functionName": "tênHàm",
  "parameterTypes": ["kiểuThamSố1", "kiểuThamSố2", ...],
  "returnType": "kiểuTrảVề"
}`}
            </pre>

            <p className="font-semibold mt-3">Ví dụ cho nhiều tham số:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
              <div>
                <p className="text-sm font-medium">Java:</p>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {`{
  "functionName": "checkUserAccess",
  "parameterTypes": ["String", "int", "boolean"],
  "returnType": "boolean"
}`}
                </pre>
              </div>
              <div>
                <p className="text-sm font-medium">Python:</p>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {`{
  "functionName": "check_user_access",
  "parameterTypes": ["str", "int", "bool"],
  "returnType": "bool"
}`}
                </pre>
              </div>
            </div>

            <div className="text-red-500 mt-2">
              <p>Lưu ý quan trọng:</p>
              <ul className="list-disc pl-6 mt-1">
                <li>
                  Sử dụng <strong>dấu ngoặc kép</strong> cho tất cả thuộc tính
                  và giá trị chuỗi
                </li>
                <li>
                  Đảm bảo có <strong>dấu phẩy</strong> giữa các phần tử trong
                  mảng parameterTypes
                </li>
                <li>
                  Kiểu dữ liệu phải phù hợp với cú pháp của từng ngôn ngữ lập
                  trình
                </li>
                <li>
                  Khi có <strong>nhiều tham số</strong>, liệt kê tất cả trong
                  mảng parameterTypes
                </li>
              </ul>
            </div>
          </div>
        }
        type="warning"
        showIcon
        className="mb-6"
      />

      <Card>
        <AdvancedProblemForm
          onSubmit={handleSubmit}
          loading={submitting}
          isCreating={true}
        />
      </Card>
    </div>
  );
};

export default CreateAdvancedProblem;
