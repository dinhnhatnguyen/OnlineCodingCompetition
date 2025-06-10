import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSun,
  FaMoon,
  FaUser,
  FaLock,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";
import { useAuth } from "../../contexts/AuthContext";
import AuthModal from "../auth/AuthModal";
import logo from "../../assets/OCCS.png";
import { Dropdown, Menu } from "antd";

const Header = () => {
  const { user, logout, login, register } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleShow = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleAuthSuccess = async (values) => {
    if (authMode === "signup") {
      return await register(values.username, values.email, values.password);
    } else {
      return await login(values.username, values.password);
    }
  };

  const handleLogout = () => {
    logout();
    setMessage("Signed out successfully");
    setMessageType("success");
    setTimeout(() => setMessage(""), 3000);
  };

  // Kiểm tra xem user có phải là admin hoặc instructor không
  const isAdminOrInstructor =
    user && (user.role === "admin" || user.role === "instructor");

  // User dropdown menu
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<FaUser />}>
        <Link to="/profile">Hồ sơ cá nhân</Link>
      </Menu.Item>
      <Menu.Item key="change-password" icon={<FaLock />}>
        <Link to="/change-password">Đổi mật khẩu</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<FaSignOutAlt />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="bg-black text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <Link to="/" className="flex items-center space-x-2">
          <img src={logo} alt="OCCS Logo" className="h-8 w-8 object-contain" />
          <div className="text-2xl font-bold logo-text">OCCS</div>
        </Link>
        <nav className="flex space-x-6">
          <Link
            to="/problems"
            className="text-gray-400 hover:text-primary-pink transition-colors"
          >
            Bài tập
          </Link>
          <Link
            to="/contests"
            className="text-gray-400 hover:text-primary-pink transition-colors"
          >
            Cuộc thi
          </Link>
          <Link
            to="/scratchpad"
            className="text-gray-400 hover:text-primary-pink transition-colors"
          >
            Bảng nháp
          </Link>
          {isAdminOrInstructor && (
            <Link
              to="/admin"
              className="text-gray-400 hover:text-pink-400 transition-colors"
            >
              Quản lý
            </Link>
          )}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {message && (
          <div
            className={`px-4 py-2 rounded ${
              messageType === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {message}
          </div>
        )}
        {user ? (
          <div className="flex items-center space-x-4">
            <Dropdown overlay={userMenu} trigger={["click"]}>
              <div className="flex items-center cursor-pointer">
                <div className="flex flex-col items-end mr-1">
                  <span className="font-bold text-primary-pink">
                    {user.username}
                  </span>
                  <span className="text-xs uppercase tracking-wider text-gray-400">
                    {user.role}
                  </span>
                </div>
                <FaChevronDown className="text-gray-400" />
              </div>
            </Dropdown>
          </div>
        ) : (
          <>
            <button
              onClick={() => handleShow("signin")}
              className="text-gray-400 hover:text-primary-pink transition-colors"
              style={{ padding: "10px 20px" }}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => handleShow("signup")}
              className="primary-btn"
            >
              Đăng ký
            </button>
          </>
        )}
      </div>

      <AuthModal
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        setMode={setAuthMode}
        onSuccess={handleAuthSuccess}
        showMessage={(msg, type) => {
          setMessage(msg);
          setMessageType(type);
          setTimeout(() => setMessage(""), 3000);
        }}
      />
    </header>
  );
};

export default Header;
