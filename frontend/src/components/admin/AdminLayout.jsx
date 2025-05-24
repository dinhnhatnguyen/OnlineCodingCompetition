import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  CodeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link, Routes, Route } from "react-router-dom";
import AdvancedProblemForm from "./AdvancedProblemForm";
import UserManagement from "./UserManagement";

const { Content, Sider } = Layout;

const AdminLayout = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={200} className="site-layout-background">
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          style={{ height: "100%", borderRight: 0 }}
        >
          <Menu.Item key="1" icon={<DashboardOutlined />}>
            <Link to="/admin">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<CodeOutlined />}>
            <Link to="/admin/problems/create">Create Problem</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<UserOutlined />}>
            <Link to="/admin/users">User Management</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ padding: "24px" }}>
        <Content
          className="site-layout-background"
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
          }}
        >
          <Routes>
            <Route path="/" element={<div>Admin Dashboard</div>} />
            <Route path="/problems/create" element={<AdvancedProblemForm />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
