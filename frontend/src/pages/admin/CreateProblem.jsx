import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
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
      message.success("Problem created successfully");
      navigate("/admin/problems");
    } catch (err) {
      console.error("Error creating problem:", err);
      message.error(err.response?.data?.message || "Failed to create problem");
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
