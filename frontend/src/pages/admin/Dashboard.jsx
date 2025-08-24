import React, { useState } from "react";
import { Layout, Menu } from "antd";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  CodeOutlined,
  TrophyOutlined,
  DashboardOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import Header from "../../components/layout/Header";
import { useAuth } from "../../contexts/AuthContext";

const { Content, Sider } = Layout;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

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

    if (path === "/admin/users") return "4";

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
        // {
        //   key: "2-1",
        //   icon: <PlusOutlined />,
        //   label: "Tạo bài tập mới",
        //   onClick: () => navigate("/admin/problems/create"),
        // },
        {
          key: "2-1",
          icon: <PlusOutlined />,
          label: "Tạo bài tập ",
          onClick: () => navigate("/admin/problems/create-advanced"),
        },
        {
          key: "2-2",
          icon: <CodeOutlined />,
          label: "🧪 Test Case Demo",
          onClick: () => navigate("/admin/problems/testcase-demo"),
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
    {
      key: "4",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      onClick: () => navigate("/admin/users"),
      // style: { display: isAdmin ? "block" : "none" }, // Chỉ hiển thị cho admin
    },
    {
      key: "5",
      icon: <ExclamationCircleOutlined />,
      label: "Quản lý báo cáo",
      onClick: () => navigate("/admin/reports"),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header />
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
