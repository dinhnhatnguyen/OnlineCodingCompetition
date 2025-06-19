import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  Modal,
  Select,
  message,
  Card,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
  getRegistrations,
  approveRegistration,
  rejectRegistration,
} from "../../api/contestRegistrationApi";
import { getContestById } from "../../api/contestCrudApi";
import moment from "moment";

const { Option } = Select;

const ContestRegistrationManagement = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showSuccess, showError } = useToast();

  const [contest, setContest] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkAction, setBulkAction] = useState("");

  useEffect(() => {
    fetchContestData();
    fetchRegistrations();
  }, [contestId]);

  const fetchContestData = async () => {
    try {
      const contestData = await getContestById(contestId, token);
      setContest(contestData);
    } catch (error) {
      console.error("Error fetching contest:", error);
      showError("Failed to load contest information");
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const data = await getRegistrations(contestId, token);
      setRegistrations(data);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      showError("Failed to load registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (registrationId) => {
    setActionLoading({ ...actionLoading, [registrationId]: true });
    try {
      await approveRegistration(registrationId, token);
      showSuccess("Registration approved successfully");
      fetchRegistrations();
    } catch (error) {
      console.error("Error approving registration:", error);
      showError("Failed to approve registration");
    } finally {
      setActionLoading({ ...actionLoading, [registrationId]: false });
    }
  };

  const handleReject = async (registrationId) => {
    setActionLoading({ ...actionLoading, [registrationId]: true });
    try {
      await rejectRegistration(registrationId, token);
      showSuccess("Registration rejected successfully");
      fetchRegistrations();
    } catch (error) {
      console.error("Error rejecting registration:", error);
      showError("Failed to reject registration");
    } finally {
      setActionLoading({ ...actionLoading, [registrationId]: false });
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedRowKeys.length === 0) {
      message.warning("Please select registrations and an action");
      return;
    }

    Modal.confirm({
      title: `Confirm Bulk ${bulkAction}`,
      content: `Are you sure you want to ${bulkAction.toLowerCase()} ${selectedRowKeys.length} registration(s)?`,
      onOk: async () => {
        try {
          const promises = selectedRowKeys.map((id) => {
            return bulkAction === "APPROVE"
              ? approveRegistration(id, token)
              : rejectRegistration(id, token);
          });

          await Promise.all(promises);
          showSuccess(`Bulk ${bulkAction.toLowerCase()} completed successfully`);
          setSelectedRowKeys([]);
          setBulkAction("");
          fetchRegistrations();
        } catch (error) {
          console.error("Error in bulk action:", error);
          showError(`Failed to ${bulkAction.toLowerCase()} some registrations`);
        }
      },
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      PENDING: { color: "orange", icon: <ClockCircleOutlined /> },
      APPROVED: { color: "green", icon: <CheckCircleOutlined /> },
      REJECTED: { color: "red", icon: <ExclamationCircleOutlined /> },
    };

    const config = statusConfig[status] || { color: "default", icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {status}
      </Tag>
    );
  };

  const columns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.username}</div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Registration Date",
      dataIndex: "registeredAt",
      key: "registeredAt",
      render: (date) => moment(date).format("MMM DD, YYYY HH:mm"),
      sorter: (a, b) => moment(a.registeredAt).unix() - moment(b.registeredAt).unix(),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Pending", value: "PENDING" },
        { text: "Approved", value: "APPROVED" },
        { text: "Rejected", value: "REJECTED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Score",
      dataIndex: "totalScore",
      key: "totalScore",
      render: (score) => score?.toFixed(2) || "0.00",
      sorter: (a, b) => (a.totalScore || 0) - (b.totalScore || 0),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.status === "PENDING" && (
            <>
              <Tooltip title="Approve">
                <Button
                  icon={<CheckOutlined />}
                  size="small"
                  type="primary"
                  loading={actionLoading[record.id]}
                  onClick={() => handleApprove(record.id)}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button
                  icon={<CloseOutlined />}
                  size="small"
                  danger
                  loading={actionLoading[record.id]}
                  onClick={() => handleReject(record.id)}
                />
              </Tooltip>
            </>
          )}
          {record.status === "APPROVED" && (
            <Tooltip title="Reject">
              <Button
                icon={<CloseOutlined />}
                size="small"
                danger
                loading={actionLoading[record.id]}
                onClick={() => handleReject(record.id)}
              />
            </Tooltip>
          )}
          {record.status === "REJECTED" && (
            <Tooltip title="Approve">
              <Button
                icon={<CheckOutlined />}
                size="small"
                type="primary"
                loading={actionLoading[record.id]}
                onClick={() => handleApprove(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record) => ({
      disabled: false,
    }),
  };

  const getStatistics = () => {
    const total = registrations.length;
    const pending = registrations.filter((r) => r.status === "PENDING").length;
    const approved = registrations.filter((r) => r.status === "APPROVED").length;
    const rejected = registrations.filter((r) => r.status === "REJECTED").length;

    return { total, pending, approved, rejected };
  };

  const stats = getStatistics();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/admin/contests")}
          >
            Back to Contests
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Registration Management</h1>
            {contest && (
              <p className="text-gray-600">Contest: {contest.title}</p>
            )}
          </div>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Registrations"
              value={stats.total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Approved"
              value={stats.approved}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Rejected"
              value={stats.rejected}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bulk Actions */}
      <div className="flex items-center space-x-4 mb-4">
        <span>Bulk Actions:</span>
        <Select
          placeholder="Select action"
          style={{ width: 150 }}
          value={bulkAction}
          onChange={setBulkAction}
        >
          <Option value="APPROVE">Approve</Option>
          <Option value="REJECT">Reject</Option>
        </Select>
        <Button
          type="primary"
          disabled={!bulkAction || selectedRowKeys.length === 0}
          onClick={handleBulkAction}
        >
          Apply to {selectedRowKeys.length} selected
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={registrations}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default ContestRegistrationManagement;
