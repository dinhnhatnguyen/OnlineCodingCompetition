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
  Dropdown,
  Menu,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  MoreOutlined,
  CodeOutlined,
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

  const handleEditAdvanced = (problem) => {
    navigate(`/admin/problems/edit-advanced/${problem.id}`);
  };

  const handleManageTestCases = (problem) => {
    navigate(`/admin/problems/testcases/${problem.id}`);
  };

  const showDeleteConfirm = (problem) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa bài toán này không?",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác.",
      okText: "Đồng ý, Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => handleDelete(problem.id),
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteProblem(id, token);
      message.success("Bài toán đã được xóa thành công");
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

  const getActionsMenu = (record) => (
    <Menu>
      <Menu.Item
        key="1"
        onClick={() => handleEdit(record)}
        icon={<EditOutlined />}
      >
        Chỉnh sửa cơ bản
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={() => handleEditAdvanced(record)}
        icon={<EditOutlined />}
      >
        Chỉnh sửa nâng cao
      </Menu.Item>
      <Menu.Item
        key="3"
        onClick={() => handleManageTestCases(record)}
        icon={<CodeOutlined />}
      >
        Quản lý test cases
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="4"
        onClick={() => showDeleteConfirm(record)}
        icon={<DeleteOutlined />}
        danger
      >
        Xóa bài toán
      </Menu.Item>
    </Menu>
  );

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
      render: (testCases, record) => (
        <Button type="link" onClick={() => handleManageTestCases(record)}>
          <Badge count={testCases?.length || 0} showZero />
        </Button>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Dropdown overlay={getActionsMenu(record)} trigger={["click"]}>
          <Button icon={<MoreOutlined />} />
        </Dropdown>
      ),
      width: 80,
      align: "center",
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý bài toán</h1>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/problems/create")}
          >
            Tạo bài toán
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/problems/create-advanced")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Tạo bài toán nâng cao
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
