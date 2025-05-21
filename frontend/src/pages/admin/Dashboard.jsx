import React, { useState } from "react";
import { Layout, Menu, Typography, Avatar } from "antd";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  AppstoreOutlined,
  CodeOutlined,
  TrophyOutlined,
  UserOutlined,
  DashboardOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  // Get current selected key based on path
  const getCurrentKey = () => {
    const path = location.pathname;

    if (path === "/admin") return "1";
    if (path === "/admin/problems") return "2";
    if (path === "/admin/problems/create") return "2-1";
    if (path === "/admin/problems/create-advanced") return "2-2";
    if (path.includes("/admin/problems/edit")) return "2";

    if (path === "/admin/contests") return "3";
    if (path === "/admin/contests/create") return "3-1";
    if (path.includes("/admin/contests/edit")) return "3";

    return "1";
  };

  const items = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Tổng quan",
      onClick: () => navigate("/admin"),
    },
    {
      key: "2",
      icon: <CodeOutlined />,
      label: "Quản lý bài tập",
      children: [
        {
          key: "2-0",
          icon: <UnorderedListOutlined />,
          label: "Danh sách bài tập",
          onClick: () => navigate("/admin/problems"),
        },
        {
          key: "2-1",
          icon: <PlusOutlined />,
          label: "Tạo bài tập mới",
          onClick: () => navigate("/admin/problems/create"),
        },
        {
          key: "2-2",
          icon: <PlusOutlined />,
          label: "Tạo bài tập nâng cao",
          onClick: () => navigate("/admin/problems/create-advanced"),
        },
      ],
    },
    {
      key: "3",
      icon: <TrophyOutlined />,
      label: "Quản lý cuộc thi",
      children: [
        {
          key: "3-0",
          icon: <UnorderedListOutlined />,
          label: "Danh sách cuộc thi",
          onClick: () => navigate("/admin/contests"),
        },
        {
          key: "3-1",
          icon: <PlusOutlined />,
          label: "Tạo cuộc thi mới",
          onClick: () => navigate("/admin/contests/create"),
        },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header className="bg-white flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center">
          <AppstoreOutlined className="text-2xl mr-3 text-primary-pink" />
          <Title level={4} style={{ margin: 0 }}>
            {user?.role === "admin" ? "Admin" : "Instructor"} Portal
          </Title>
        </div>
        <div className="flex items-center">
          <Avatar icon={<UserOutlined />} className="mr-2" />
          <span>{user?.username}</span>
        </div>
      </Header>
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          className="bg-gray-100"
          theme="light"
          width={240}
        >
          <Menu
            mode="inline"
            defaultOpenKeys={["2", "3"]}
            selectedKeys={[getCurrentKey()]}
            style={{ height: "100%", borderRight: 0 }}
            items={items}
          />
        </Sider>
        <Layout className="p-6 bg-gray-50">
          <Content className="bg-white p-6 rounded-lg shadow-sm">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
