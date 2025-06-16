import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Card, Alert } from "antd";
import AdvancedProblemForm from "../../components/admin/AdvancedProblemForm";
import { createProblemWithTestCases } from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";

const CreateProblem = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      console.log("Submitting problem data:", formData);

      await createProblemWithTestCases(formData, token);
      Modal.success({
        title: "🎉 Thành công",
        content: "Bài toán đã được tạo thành công với tất cả test cases!",
        onOk: () => navigate("/admin/problems"),
      });
    } catch (err) {
      console.error("Error creating problem:", err);
      Modal.error({
        title: "❌ Lỗi",
        content: err.response?.data?.message || "Không thể tạo bài toán mới",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Card className="mb-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">🚀 Tạo Bài Toán Mới</h1>
          <p className="text-gray-600">
            Sử dụng công cụ tạo test case nhanh để tạo bài toán chất lượng cao
          </p>
        </div>
      </Card>

      <Alert
        message="✨ Tính năng mới: Test Case Manager nâng cấp"
        description="Bây giờ bạn có thể tạo test cases nhanh chóng với templates, bulk input, CSV import và analytics chất lượng!"
        type="success"
        showIcon
        className="mb-6"
      />

      <AdvancedProblemForm
        onSubmit={handleSubmit}
        loading={loading}
        isCreating={true}
      />
    </div>
  );
};

export default CreateProblem;
