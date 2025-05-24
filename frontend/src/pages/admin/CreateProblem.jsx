import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import ProblemForm from "../../components/admin/ProblemForm";
import { createProblemWithTestCases } from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";

const CreateProblem = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await createProblemWithTestCases(values, token);
      Modal.success({
        title: "Thành công",
        content: "Bài toán đã được tạo thành công!",
        onOk: () => navigate("/admin/problems"),
      });
    } catch (err) {
      console.error("Error creating problem:", err);
      Modal.error({
        title: "Lỗi",
        content: err.response?.data?.message || "Không thể tạo bài toán mới",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Problem</h1>
      <ProblemForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default CreateProblem;
