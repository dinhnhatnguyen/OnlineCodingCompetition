import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button, Menu, Dropdown } from "antd";
import { UserOutlined, DownOutlined } from "@ant-design/icons";

const Navbar = () => {
  const { user, logout } = useAuth();

  const userMenu = (
    <Menu>
      {user?.role === "ADMIN" && (
        <Menu.Item key="admin-problems">
          <Link to="/admin/problems">Manage Problems</Link>
        </Menu.Item>
      )}
      <Menu.Item key="logout" onClick={logout}>
        Sign Out
      </Menu.Item>
    </Menu>
  );

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Online Coding Competition
        </Link>

        <div className="flex items-center space-x-4">
          <Link to="/problems" className="hover:text-gray-300">
            Problems
          </Link>
          <Link to="/contests" className="hover:text-gray-300">
            Contests
          </Link>
          {user ? (
            <Dropdown overlay={userMenu} trigger={["click"]}>
              <Button type="text" className="text-white">
                {user.username} <DownOutlined />
              </Button>
            </Dropdown>
          ) : (
            <Link to="/login">
              <Button type="primary">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
