import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Table, Tag, Tooltip, Space, Badge, Dropdown } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  MoreOutlined,
  CodeOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import {
  getProblems,
  getMyProblems,
  deleteProblem,
  getContestsContainingProblem,
} from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import ProblemContestsModal from "../../components/admin/ProblemContestsModal";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  problem,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[480px] relative animate-fadeIn shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <CloseOutlined />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <ExclamationCircleOutlined className="text-2xl text-red-500" />
          <h3 className="text-xl font-semibold text-gray-800">
            Xác nhận xóa bài toán
          </h3>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-600 mb-3">
            Bạn có chắc chắn muốn xóa bài toán{" "}
            <span className="font-semibold">"{problem?.title}"</span> không?
          </p>
          <p className="text-red-500 flex items-center gap-2">
            <span>⚠️</span> Hành động này có thể hoàn tác sau.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Đang xóa...</span>
              </>
            ) : (
              "Đồng ý, Xóa"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const ProblemManagement = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [contestsModalVisible, setContestsModalVisible] = useState(false);
  const [problemWithContests, setProblemWithContests] = useState(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const { showSuccess, showError } = useToast();

  const fetchProblems = async () => {
    setLoading(true);
    try {
      let data;
      if (isAdmin) {
        data = await getProblems();
      } else {
        data = await getMyProblems(token);
      }
      // Chỉ hiển thị các bài toán chưa bị xóa
      const activeProblems = data.filter((p) => !p.deleted);
      setProblems(activeProblems);
    } catch (err) {
      console.error("Error fetching problems:", err);
      showError(err.response?.data?.message || "Failed to fetch problems");
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

  const handleDeleteClick = async (problem) => {
    try {
      // Kiểm tra xem bài toán có đang nằm trong cuộc thi nào không
      const contests = await getContestsContainingProblem(problem.id, token);

      if (contests && contests.length > 0) {
        // Có cuộc thi chứa bài toán này, hiển thị modal thông tin
        setProblemWithContests(problem);
        setContestsModalVisible(true);
      } else {
        // Không có cuộc thi nào, hiển thị modal xác nhận xóa bình thường
        setSelectedProblem(problem);
        setDeleteModalVisible(true);
      }
    } catch (error) {
      // Nếu có lỗi khi kiểm tra (ví dụ: 409 Conflict), hiển thị modal contests
      if (error.response?.status === 409) {
        const errorData = error.response.data;
        if (errorData.errors && errorData.errors.activeContests) {
          setProblemWithContests(problem);
          setContestsModalVisible(true);
          return;
        }
      }

      console.error("Error checking contests:", error);
      // Nếu có lỗi khác, vẫn cho phép thử xóa
      setSelectedProblem(problem);
      setDeleteModalVisible(true);
    }
  };

  const handleDelete = async () => {
    try {
      if (!token) {
        showError("Bạn cần đăng nhập lại để thực hiện thao tác này");
        return;
      }

      if (!selectedProblem?.id) {
        showError("ID bài toán không hợp lệ");
        return;
      }

      setIsDeleting(true);
      const result = await deleteProblem(selectedProblem.id, token);

      if (result.success) {
        showSuccess(result.message || "Bài toán đã được xóa thành công");
        await fetchProblems();
        setDeleteModalVisible(false);
      }
    } catch (err) {
      console.error("Error deleting problem:", err);

      // Kiểm tra nếu lỗi là do bài toán đang trong cuộc thi
      if (err.response?.status === 409) {
        const errorData = err.response.data;
        if (errorData.errors && errorData.errors.activeContests) {
          setDeleteModalVisible(false);
          setProblemWithContests(selectedProblem);
          setContestsModalVisible(true);
          return;
        }
      }

      showError(err.message || "Lỗi khi xóa bài toán");
    } finally {
      setIsDeleting(false);
    }
  };

  const getDropdownItems = (record) => [
    {
      key: "1",
      label: "Chỉnh sửa cơ bản",
      icon: <EditOutlined />,
      onClick: () => handleEdit(record),
    },
    {
      key: "2",
      label: "Chỉnh sửa nâng cao",
      icon: <EditOutlined />,
      onClick: () => handleEditAdvanced(record),
    },
    {
      key: "3",
      label: "Quản lý test cases",
      icon: <CodeOutlined />,
      onClick: () => handleManageTestCases(record),
    },
    {
      type: "divider",
    },
    {
      key: "4",
      label: "Xóa bài toán",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteClick(record),
    },
  ];

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
            {record.deleted && (
              <Tooltip
                title={`Đã xóa bởi ${record.deletedBy} vào ${new Date(
                  record.deletedAt
                ).toLocaleString()}`}
              >
                <Tag color="red">Đã xóa</Tag>
              </Tooltip>
            )}
          </div>
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
      render: (_, record) =>
        !record.deleted && (
          <Dropdown
            menu={{ items: getDropdownItems(record) }}
            trigger={["click"]}
            placement="bottomRight"
            overlayStyle={{ minWidth: 180 }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        ),
      width: 100,
      align: "center",
    },
  ];

  const getDifficultyTag = (difficulty) => {
    const colors = {
      EASY: "green",
      MEDIUM: "gold",
      HARD: "red",
    };
    return <Tag color={colors[difficulty] || "default"}>{difficulty}</Tag>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý bài toán</h1>
        <Space>
          {/* <Button
            type="default"
            onClick={() => navigate("/admin/problems/deleted")}
          >
            Xem bài toán đã xóa
          </Button> */}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/admin/problems/create-advanced")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Tạo bài toán mới
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

      <DeleteConfirmationModal
        isOpen={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
        problem={selectedProblem}
        isLoading={isDeleting}
      />

      <ProblemContestsModal
        isOpen={contestsModalVisible}
        onClose={() => {
          setContestsModalVisible(false);
          setProblemWithContests(null);
        }}
        problem={problemWithContests}
        onProblemRemoved={() => {
          fetchProblems(); // Refresh the problems list
        }}
      />
    </div>
  );
};

export default ProblemManagement;
