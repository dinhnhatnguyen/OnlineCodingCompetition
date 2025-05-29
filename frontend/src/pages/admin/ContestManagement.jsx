import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Space, Modal, Tag, Tooltip, Badge } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  LockOutlined,
  UnlockOutlined,
  CalendarOutlined,
  TeamOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { getContests, deleteContest } from "../../api/contestCrudApi";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import moment from "moment";

const DeleteConfirmPopup = ({ isOpen, onClose, onConfirm, contest }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <ExclamationCircleOutlined className="text-red-500 text-2xl mr-2" />
          <h3 className="text-lg font-semibold">Xác nhận xóa cuộc thi</h3>
        </div>

        <p className="text-gray-600 mb-2">
          Bạn có chắc chắn muốn xóa cuộc thi:
        </p>
        <p className="font-medium mb-4">{contest?.title}</p>

        <div className="text-sm text-gray-500 mb-6">
          Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan
          đến cuộc thi này.
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

const ContestManagement = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [contestToDelete, setContestToDelete] = useState(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const data = await getContests();

      // Filter contests for instructors (only show their own)
      const filteredData = isAdmin
        ? data
        : data.filter((contest) => contest.createdById === user?.id);

      // Sort contests by createdAt in descending order (newest first)
      const sortedData = filteredData.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setContests(sortedData);
      // showSuccess("Tải danh sách cuộc thi thành công");
    } catch (error) {
      console.error("Error fetching contests:", error);
      showError("Không thể tải danh sách cuộc thi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContest = () => {
    navigate("/admin/contests/create");
  };

  const handleEditContest = (id) => {
    navigate(`/admin/contests/edit/${id}`);
  };

  const showDeleteConfirm = (contest) => {
    setContestToDelete(contest);
    setDeletePopupOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const result = await deleteContest(contestToDelete.id, token);
      if (result.success) {
        showSuccess(result.message || "Xóa cuộc thi thành công");
        setDeletePopupOpen(false);
        setContestToDelete(null);
        fetchContests(); // Refresh the list
      }
    } catch (error) {
      console.error("Error deleting contest:", error);
      // Hiển thị message lỗi cụ thể từ server hoặc message mặc định
      showError(error.message || "Không thể xóa cuộc thi");
    }
  };

  const handleDeleteCancel = () => {
    setDeletePopupOpen(false);
    setContestToDelete(null);
  };

  const getStatusTag = (status) => {
    const colors = {
      ONGOING: "green",
      UPCOMING: "blue",
      COMPLETED: "gray",
      DRAFT: "purple",
      CANCELLED: "red",
    };

    return <Tag color={colors[status] || "default"}>{status}</Tag>;
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return "Not set";
    return moment(dateTime).format("MMM DD, YYYY HH:mm");
  };

  const getContestDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";
    const start = moment(startTime);
    const end = moment(endTime);
    const duration = moment.duration(end.diff(start));
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    return `${hours}h ${minutes}m`;
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Draft", value: "DRAFT" },
        { text: "Upcoming", value: "UPCOMING" },
        { text: "Ongoing", value: "ONGOING" },
        { text: "Completed", value: "COMPLETED" },
        { text: "Cancelled", value: "CANCELLED" },
      ],
      onFilter: (value, record) => record.status === value,
      width: 120,
    },
    {
      title: "Visibility",
      dataIndex: "public",
      key: "public",
      render: (isPublic) =>
        isPublic ? (
          <Tooltip title="Public Contest">
            <Tag icon={<UnlockOutlined />} color="blue">
              Public
            </Tag>
          </Tooltip>
        ) : (
          <Tooltip title="Private Contest">
            <Tag icon={<LockOutlined />} color="orange">
              Private
            </Tag>
          </Tooltip>
        ),
      filters: [
        { text: "Public", value: true },
        { text: "Private", value: false },
      ],
      onFilter: (value, record) => record.public === value,
      width: 120,
    },
    {
      title: "Schedule",
      key: "schedule",
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            <CalendarOutlined className="mr-1" />
            <span className="text-xs">
              Start: {formatDateTime(record.startTime)}
            </span>
          </div>
          <div>
            <CalendarOutlined className="mr-1" />
            <span className="text-xs">
              End: {formatDateTime(record.endTime)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Duration: {getContestDuration(record.startTime, record.endTime)}
          </div>
        </Space>
      ),
    },
    {
      title: "Participants",
      key: "participants",
      render: (_, record) => (
        <Space>
          <TeamOutlined />
          <span>
            {record.currentParticipants || 0}/{record.maxParticipants || "∞"}
          </span>
        </Space>
      ),
      width: 120,
    },
    {
      title: "Problems",
      key: "problems",
      render: (_, record) => (
        <Space>
          <FileOutlined />
          <Badge count={record.problemIds?.length || 0} showZero />
        </Space>
      ),
      width: 100,
      align: "center",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit Contest">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditContest(record.id)}
              type="primary"
              size="small"
            />
          </Tooltip>
          <Tooltip title="Delete Contest">
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
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Contest Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateContest}
        >
          Create Contest
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={contests}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      <DeleteConfirmPopup
        isOpen={deletePopupOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        contest={contestToDelete}
      />
    </div>
  );
};

export default ContestManagement;
