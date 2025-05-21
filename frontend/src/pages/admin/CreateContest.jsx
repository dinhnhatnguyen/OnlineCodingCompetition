import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import ContestForm from "../../components/admin/ContestForm";
import { createContest } from "../../api/contestCrudApi";
import { useAuth } from "../../contexts/AuthContext";

const CreateContest = () => {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await createContest(values, token);
      message.success("Contest created successfully");
      navigate("/admin/contests");
    } catch (error) {
      console.error("Error creating contest:", error);
      message.error(
        error.response?.data?.message || "Failed to create contest"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Contest</h1>
      <ContestForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default CreateContest;
