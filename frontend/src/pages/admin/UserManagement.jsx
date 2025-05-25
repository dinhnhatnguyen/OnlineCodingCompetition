import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Modal,
  Select,
  Space,
  Typography,
  Card,
  Tooltip,
  Input,
} from "antd";
import { UserOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";
import { getAllUsers, updateUserRole } from "../../api/userApi";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [searchText, setSearchText] = useState("");
  const { user, token } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra role từ token
    if (!user || user.role !== "admin") {
      showError("Bạn không có quyền truy cập trang này");
      navigate("/");
      return;
    }
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(token);
      setUsers(data);
    } catch (error) {
      showError("Không thể tải danh sách người dùng");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user) => {
    // Không cho phép sửa role của admin
    if (user.role === "ADMIN") {
      showError("Không thể thay đổi quyền của Admin");
      return;
    }
    setSelectedUser(user);
    setSelectedRole(user.role);
    setEditModalVisible(true);
  };

  const handleModalOk = async () => {
    // Kiểm tra lại một lần nữa để đảm bảo không thay đổi role của admin
    if (selectedUser.role === "ADMIN") {
      showError("Không thể thay đổi quyền của Admin");
      return;
    }

    // Kiểm tra nếu role không thay đổi
    if (selectedUser.role === selectedRole) {
      showError("Vui lòng chọn quyền khác với quyền hiện tại");
      return;
    }

    try {
      await updateUserRole(selectedUser.id, selectedRole, token);
      showSuccess(
        `Đã cập nhật quyền của người dùng ${selectedUser.username} thành ${selectedRole}`
      );
      setEditModalVisible(false);
      setSelectedUser(null);
      setSelectedRole(null);
      fetchUsers(); // Tải lại danh sách
    } catch (error) {
      showError("Không thể cập nhật quyền người dùng");
      console.error("Error updating user role:", error);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: "red",
      INSTRUCTOR: "blue",
      USER: "green",
    };
    return colors[role] || "default";
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.role.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Quyền",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color={getRoleColor(role)}>{role}</Tag>,
      filters: [
        { text: "Admin", value: "ADMIN" },
        { text: "Instructor", value: "INSTRUCTOR" },
        { text: "User", value: "USER" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Tooltip
          title={
            record.role === "ADMIN"
              ? "Không thể sửa quyền của Admin"
              : "Sửa quyền"
          }
        >
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditRole(record)}
            disabled={record.role === "ADMIN"}
          >
            Sửa quyền
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2}>Quản lý người dùng</Title>
          <Input
            placeholder="Tìm kiếm người dùng..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} người dùng`,
          }}
        />

        <Modal
          title="Thay đổi quyền người dùng"
          open={editModalVisible}
          onOk={handleModalOk}
          onCancel={() => {
            setEditModalVisible(false);
            setSelectedUser(null);
            setSelectedRole(null);
          }}
          okText="Cập nhật"
          cancelText="Hủy"
        >
          <div className="mb-4">
            <p>
              <strong>Username:</strong> {selectedUser?.username}
            </p>
            <p>
              <strong>Email:</strong> {selectedUser?.email}
            </p>
            <p>
              <strong>Quyền hiện tại:</strong>{" "}
              <Tag color={getRoleColor(selectedUser?.role)}>
                {selectedUser?.role}
              </Tag>
            </p>
          </div>
          <div>
            <p className="mb-2">
              <strong>Quyền mới:</strong>
            </p>
            <Select
              value={selectedRole}
              onChange={setSelectedRole}
              style={{ width: "100%" }}
            >
              <Option value="USER">User</Option>
              <Option value="INSTRUCTOR">Instructor</Option>
              <Option value="ADMIN">Admin</Option>
            </Select>
          </div>
        </Modal>
      </Card>
    </div>
  );
};

export default UserManagement;
