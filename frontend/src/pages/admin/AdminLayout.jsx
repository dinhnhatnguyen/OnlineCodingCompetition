import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Breadcrumb,
  Button,
  Drawer,
  Space,
  Typography,
  Dropdown,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LaptopOutlined,
  CodeOutlined,
  LogoutOutlined,
  DashboardOutlined,
  TrophyOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import HelpDocumentation from "../../components/admin/HelpDocumentation";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [helpDocsVisible, setHelpDocsVisible] = useState(false);
  const { logout } = useAuth();

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
    return {
      title: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: url,
    };
  });

  const userMenuItems = [
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  const navigationItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Trang chủ",
      path: "/admin",
    },
    {
      key: "problems",
      icon: <CodeOutlined />,
      label: "Bài toán",
      path: "/admin/problems",
    },
    {
      key: "contests",
      icon: <TrophyOutlined />,
      label: "Cuộc thi",
      path: "/admin/contests",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Người dùng",
      path: "/admin/users",
    },
    {
      key: "submissions",
      icon: <LaptopOutlined />,
      label: "Bài nộp",
      path: "/admin/submissions",
    },
    {
      key: "help",
      icon: <QuestionCircleOutlined />,
      label: "Trợ giúp",
      onClick: () => setHelpDocsVisible(true),
    },
  ];

  const showHelpDocs = () => {
    setHelpDocsVisible(true);
  };

  const hideHelpDocs = () => {
    setHelpDocsVisible(false);
  };

  return (
    <Layout className="min-h-screen">
      {/* Sidebar for desktop */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="hidden lg:block"
        theme="light"
      >
        <div className="p-4 flex items-center justify-center">
          <Title level={collapsed ? 5 : 4} className="m-0">
            {collapsed ? "Admin" : "Admin Portal"}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathSegments[1] || "dashboard"]}
          className="h-full border-r-0"
        >
          {navigationItems.map((item) =>
            item.path ? (
              <Menu.Item key={item.key} icon={item.icon}>
                <Link to={item.path}>{item.label}</Link>
              </Menu.Item>
            ) : (
              <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
                {item.label}
              </Menu.Item>
            )
          )}
        </Menu>
      </Sider>

      <Layout>
        <Header className="bg-white flex justify-between items-center px-4 shadow-sm">
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:block mr-4"
            />
            <Button
              type="text"
              icon={<MenuUnfoldOutlined />}
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden mr-4"
            />
            <Breadcrumb items={breadcrumbItems} className="hidden md:flex" />
          </div>
          <div className="flex items-center">
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              onClick={showHelpDocs}
              className="mr-2"
            >
              Trợ giúp
            </Button>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Button type="text" icon={<UserOutlined />}>
                Admin
              </Button>
            </Dropdown>
          </div>
        </Header>

        <Content className="p-6">
          <Outlet />
        </Content>
      </Layout>

      {/* Mobile Sidebar Drawer */}
      <Drawer
        title="Admin Portal"
        placement="left"
        onClose={() => setMobileSidebarOpen(false)}
        open={mobileSidebarOpen}
        bodyStyle={{ padding: 0 }}
      >
        <Menu
          mode="inline"
          selectedKeys={[pathSegments[1] || "dashboard"]}
          className="h-full border-r-0"
        >
          {navigationItems.map((item) =>
            item.path ? (
              <Menu.Item
                key={item.key}
                icon={item.icon}
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Link to={item.path}>{item.label}</Link>
              </Menu.Item>
            ) : (
              <Menu.Item
                key={item.key}
                icon={item.icon}
                onClick={() => {
                  item.onClick();
                  setMobileSidebarOpen(false);
                }}
              >
                {item.label}
              </Menu.Item>
            )
          )}
        </Menu>
      </Drawer>

      {/* Help Documentation Drawer */}
      <Drawer
        title="Hướng dẫn tạo bài toán và test cases"
        placement="right"
        width={720}
        onClose={hideHelpDocs}
        open={helpDocsVisible}
        extra={
          <Space>
            <Button onClick={hideHelpDocs}>Đóng</Button>
          </Space>
        }
      >
        <HelpDocumentation />
      </Drawer>
    </Layout>
  );
}

export default AdminLayout;
