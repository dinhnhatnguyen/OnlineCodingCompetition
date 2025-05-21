import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProblems, deleteProblem } from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Table, Modal, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const ProblemManagement = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();

  const fetchProblems = async () => {
    try {
      const data = await getProblems();
      setProblems(data);
    } catch (err) {
      console.error("Error fetching problems:", err);
      message.error(err.response?.data?.message || "Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleEdit = (problem) => {
    navigate(`/admin/problems/edit/${problem.id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteProblem(selectedProblem.id, token);
      message.success("Problem deleted successfully");
      setDeleteModalVisible(false);
      fetchProblems();
    } catch (err) {
      console.error("Error deleting problem:", err);
      message.error(err.response?.data?.message || "Failed to delete problem");
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty",
      key: "difficulty",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="primary"
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => {
              setSelectedProblem(record);
              setDeleteModalVisible(true);
            }}
            danger
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Problem Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/problems/create")}
        >
          Create New Problem
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={problems}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete this problem?</p>
      </Modal>
    </div>
  );
};

export default ProblemManagement;
