import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProblems, deleteProblem } from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";
import {
  Button,
  Table,
  Modal,
  message,
  Tag,
  Tooltip,
  Space,
  Badge,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";

const ProblemManagement = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const { confirm } = Modal;

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const data = await getProblems();

      // Filter problems for instructors (only show their own)
      const filteredData = isAdmin
        ? data
        : data.filter((problem) => problem.createdById === user?.id);

      setProblems(filteredData);
    } catch (err) {
      console.error("Error fetching problems:", err);
      message.error(err.response?.data?.message || "Failed to fetch problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [user, isAdmin]);

  const handleEdit = (problem) => {
    navigate(`/admin/problems/edit/${problem.id}`);
  };

  const showDeleteConfirm = (problem) => {
    confirm({
      title: "Are you sure you want to delete this problem?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => handleDelete(problem.id),
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteProblem(id, token);
      message.success("Problem deleted successfully");
      fetchProblems();
    } catch (err) {
      console.error("Error deleting problem:", err);
      message.error(err.response?.data?.message || "Failed to delete problem");
    }
  };

  const getDifficultyTag = (difficulty) => {
    const colors = {
      EASY: "green",
      MEDIUM: "gold",
      HARD: "red",
    };

    return <Tag color={colors[difficulty] || "default"}>{difficulty}</Tag>;
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div className="text-xs text-gray-500">ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty",
      key: "difficulty",
      render: (difficulty) => getDifficultyTag(difficulty),
      filters: [
        { text: "Easy", value: "EASY" },
        { text: "Medium", value: "MEDIUM" },
        { text: "Hard", value: "HARD" },
      ],
      onFilter: (value, record) => record.difficulty === value,
      width: 120,
    },
    {
      title: "Limits",
      key: "limits",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>
            <ClockCircleOutlined /> {record.timeLimit || 1000} ms
          </span>
          <span>
            <DatabaseOutlined /> {record.memoryLimit || 64} MB
          </span>
        </Space>
      ),
      width: 120,
    },
    {
      title: "Topics",
      dataIndex: "topics",
      key: "topics",
      render: (topics) => (
        <div className="flex flex-wrap gap-1">
          {topics && topics.length > 0 ? (
            topics.map((topic) => <Tag key={topic}>{topic}</Tag>)
          ) : (
            <span className="text-gray-400">None</span>
          )}
        </div>
      ),
    },
    {
      title: "Languages",
      key: "languages",
      dataIndex: "allowedLanguages",
      render: (languages) => (
        <div className="flex flex-wrap gap-1">
          {languages && languages.length > 0 ? (
            languages.map((lang) => (
              <Tag key={lang} color="blue">
                {lang}
              </Tag>
            ))
          ) : (
            <span className="text-gray-400">None</span>
          )}
        </div>
      ),
    },
    {
      title: "Test Cases",
      dataIndex: "testCases",
      key: "testCases",
      render: (testCases) => <Badge count={testCases?.length || 0} showZero />,
      width: 100,
      align: "center",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Problem">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              type="primary"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete Problem">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record)}
              danger
              size="small"
            />
          </Tooltip>
        </Space>
      ),
      width: 100,
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Problem Management</h1>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/problems/create")}
          >
            Create Problem
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/problems/create-advanced")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Create with Test Cases
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={problems}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default ProblemManagement;
