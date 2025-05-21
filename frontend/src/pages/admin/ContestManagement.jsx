import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Modal,
  message,
  Tag,
  Tooltip,
  Badge,
} from "antd";
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
import moment from "moment";

const ContestManagement = () => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const { confirm } = Modal;

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

      setContests(filteredData);
    } catch (error) {
      console.error("Error fetching contests:", error);
      message.error("Failed to load contests");
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
    confirm({
      title: "Are you sure you want to delete this contest?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => handleDeleteContest(contest.id),
    });
  };

  const handleDeleteContest = async (id) => {
    try {
      await deleteContest(id, token);
      message.success("Contest deleted successfully");
      fetchContests(); // Refresh the list
    } catch (error) {
      console.error("Error deleting contest:", error);
      message.error("Failed to delete contest");
    }
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
      dataIndex: "isPublic",
      key: "isPublic",
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
      onFilter: (value, record) => record.isPublic === value,
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
    </div>
  );
};

export default ContestManagement;
