import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import AdvancedProblemForm from "../../components/admin/AdvancedProblemForm";
import { createProblemWithTestCases } from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";

const CreateAdvancedProblem = () => {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await createProblemWithTestCases(values, token);
      message.success("Problem created successfully with test cases");
      navigate("/admin/problems");
    } catch (error) {
      console.error("Error creating problem:", error);
      message.error(
        error.response?.data?.message || "Failed to create problem"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Create New Problem with Test Cases
      </h1>
      <AdvancedProblemForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default CreateAdvancedProblem;
