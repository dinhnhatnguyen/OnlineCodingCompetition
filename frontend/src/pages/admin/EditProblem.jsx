import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import ProblemForm from "../../components/admin/ProblemForm";
import { getProblemById, updateProblem } from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";

const EditProblem = () => {
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const { token } = useAuth();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const problem = await getProblemById(id);
        setInitialValues(problem);
      } catch (err) {
        console.error("Error fetching problem:", err);
        message.error(
          err.response?.data?.message || "Failed to fetch problem details"
        );
        navigate("/admin/problems");
      }
    };

    fetchProblem();
  }, [id, navigate]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      await updateProblem(id, values, token);
      message.success("Problem updated successfully");
      navigate("/admin/problems");
    } catch (err) {
      console.error("Error updating problem:", err);
      message.error(err.response?.data?.message || "Failed to update problem");
    } finally {
      setLoading(false);
    }
  };

  if (!initialValues) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Problem</h1>
      <ProblemForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
};

export default EditProblem;
