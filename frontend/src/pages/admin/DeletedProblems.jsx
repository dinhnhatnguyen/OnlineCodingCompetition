import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Tag, Tooltip, Space, Badge } from "antd";
import {
  RollbackOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { getProblems, restoreProblem } from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const DeletedProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);
  const { token } = useAuth();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const data = await getProblems();
      // Chỉ lấy các bài toán đã bị xóa
      const deletedProblems = data.filter((p) => p.deleted);
      setProblems(deletedProblems);
    } catch (err) {
      console.error("Error fetching deleted problems:", err);
      showError(
        err.response?.data?.message || "Failed to fetch deleted problems"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleRestore = async (problemId) => {
    try {
      setRestoring(problemId);
      const result = await restoreProblem(problemId, token);
      if (result.success) {
        showSuccess("Bài toán đã được khôi phục thành công");
        await fetchProblems();
      }
    } catch (err) {
      console.error("Error restoring problem:", err);
      showError(err.message || "Lỗi khi khôi phục bài toán");
    } finally {
      setRestoring(null);
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div className="flex items-center gap-2">
            {text}
            <Tooltip
              title={`Đã xóa bởi ${record.deletedBy} vào ${new Date(
                record.deletedAt
              ).toLocaleString()}`}
            >
              <Tag color="red">Đã xóa</Tag>
            </Tooltip>
          </div>
          <div className="text-xs text-gray-500">ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: "Difficulty",
      dataIndex: "difficulty",
      key: "difficulty",
      render: (difficulty) => {
        const colors = {
          EASY: "green",
          MEDIUM: "gold",
          HARD: "red",
        };
        return <Tag color={colors[difficulty] || "default"}>{difficulty}</Tag>;
      },
      filters: [
        { text: "Easy", value: "EASY" },
        { text: "Medium", value: "MEDIUM" },
        { text: "Hard", value: "HARD" },
      ],
      onFilter: (value, record) => record.difficulty === value,
      width: 120,
    },
    {
      title: "Deleted Info",
      key: "deletedInfo",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>
            <UserOutlined /> {record.deletedBy}
          </span>
          <span>
            <ClockCircleOutlined />{" "}
            {new Date(record.deletedAt).toLocaleString()}
          </span>
        </Space>
      ),
      width: 200,
    },
    {
      title: "Limits",
      key: "limits",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <span>
            <ClockCircleOutlined /> {record.defaultTimeLimit || 1000} ms
          </span>
          <span>
            <DatabaseOutlined /> {record.defaultMemoryLimit || 64} MB
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
      dataIndex: "supportedLanguages",
      render: (languages) => (
        <div className="flex flex-wrap gap-1">
          {languages &&
            Object.entries(languages).map(
              ([lang, isSupported]) =>
                isSupported && (
                  <Tag key={lang} color="blue">
                    {lang}
                  </Tag>
                )
            )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<RollbackOutlined />}
          onClick={() => handleRestore(record.id)}
          loading={restoring === record.id}
        >
          Khôi phục
        </Button>
      ),
      width: 120,
      align: "center",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bài toán đã xóa</h1>
        <Button type="default" onClick={() => navigate("/admin/problems")}>
          Quay lại danh sách bài toán
        </Button>
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

export default DeletedProblems;
