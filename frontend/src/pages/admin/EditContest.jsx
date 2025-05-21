import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { message, Spin } from "antd";
import ContestForm from "../../components/admin/ContestForm";
import { getContestById, updateContest } from "../../api/contestCrudApi";
import { useAuth } from "../../contexts/AuthContext";

const EditContest = () => {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchContest();
  }, [id]);

  const fetchContest = async () => {
    setFetching(true);
    try {
      const data = await getContestById(id);

      // Check if instructor is editing their own contest
      if (!isAdmin && data.createdById !== user?.id) {
        message.error("You don't have permission to edit this contest");
        navigate("/admin/contests");
        return;
      }

      setContest(data);
    } catch (error) {
      console.error("Error fetching contest:", error);
      message.error("Failed to load contest");
      navigate("/admin/contests");
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await updateContest(id, values, token);
      message.success("Contest updated successfully");
      navigate("/admin/contests");
    } catch (error) {
      console.error("Error updating contest:", error);
      message.error(
        error.response?.data?.message || "Failed to update contest"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading contest..." />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Contest</h1>
      {contest && (
        <ContestForm
          initialValues={contest}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}
    </div>
  );
};

export default EditContest;
