import React, { useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa"; // Thêm biểu tượng sun/moon
import logo from "../../assets/OCCS.png";
import AuthModal from "../auth/AuthModal";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  // Giả lập trạng thái theme (light/dark)
  const isDarkMode = true; // Có thể thay bằng logic thực tế để toggle theme
  const { user, signOut, signIn } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleShow = (mode) => {
    setAuthMode(mode);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setMessage("");
  };

  const handleSuccess = (userData) => {
    signIn(userData);
    setShowModal(false);
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 2000);
  };

  return (
    <header className="bg-black text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <a href="/" className="flex items-center space-x-2">
          <img src={logo} alt="OCCS Logo" className="h-8 w-8 object-contain" />
          <div className="text-2xl font-bold logo-text">OCCS</div>
        </a>
        <nav className="flex space-x-6">
          <a href="/problems" className="text-gray-400 hover:text-primary-pink">
            Problems
          </a>
          <a href="#" className="text-gray-400 hover:text-primary-pink">
            Contests
          </a>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        {!user ? (
          <>
            <button
              className="text-gray-400 hover:text-primary-pink"
              onClick={() => handleShow("signin")}
            >
              Sign in
            </button>
            <button
              className="primary-btn"
              onClick={() => handleShow("signup")}
            >
              Sign up
            </button>
          </>
        ) : (
          <button className="primary-btn" onClick={signOut}>
            Sign out
          </button>
        )}
        <button className="text-gray-400 hover:text-primary-pink">
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>
      <AuthModal
        mode={authMode}
        onClose={handleClose}
        onSuccess={handleSuccess}
        show={showModal}
        setMode={setAuthMode}
        showMessage={showMessage}
      />
      {message && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded text-white z-50 ${
            messageType === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {message}
        </div>
      )}
    </header>
  );
};

export default Header;
