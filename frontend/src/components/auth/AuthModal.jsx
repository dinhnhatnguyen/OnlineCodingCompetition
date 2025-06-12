import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaSun, FaMoon } from "react-icons/fa";
import { Link } from "react-router-dom";

const AuthModal = ({
  mode = "signin",
  onClose,
  onSuccess,
  show,
  setMode,
  showMessage,
}) => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!show) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (form.password !== form.confirmPassword) {
          setError("Mật khẩu không khớp");
          setLoading(false);
          return;
        }

        const response = await onSuccess({
          username: form.username,
          email: form.email,
          password: form.password,
        });
        console.log("Signup response:", response);

        if (response && response.message) {
          if (response.message == "User registered successfully!") {
            showMessage("Đăng ký thành công! Đang chuyển hướng...", "success");
            onClose();
          } else {
            setError(response.message);
          }
        } else {
          setError("Phản hồi không mong đợi từ máy chủ");
        }
      } else {
        await onSuccess({
          username: form.username,
          password: form.password,
        });
        showMessage("Đăng nhập thành công!", "success");
        onClose();
      }
    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-lg p-8 w-full max-w-md relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === "signin" ? "Đăng nhập" : "Đăng ký"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Tên đăng nhập</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full p-2 rounded bg-zinc-800 text-white"
              required
            />
          </div>
          {mode === "signup" && (
            <div>
              <label className="block mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-2 rounded bg-zinc-800 text-white"
                required
              />
            </div>
          )}
          <div>
            <label className="block mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                className="w-full p-2 rounded bg-zinc-800 text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {mode === "signin" && (
              <div className="text-right mt-1">
                <Link
                  to="/forgot-password"
                  className="text-primary-pink hover:underline text-sm"
                  onClick={onClose}
                >
                  Quên mật khẩu?
                </Link>
              </div>
            )}
          </div>
          {mode === "signup" && (
            <div>
              <label className="block mb-1">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-2 rounded bg-zinc-800 text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            className="w-full primary-btn mt-2"
            disabled={loading}
          >
            {loading
              ? "Đang xử lý..."
              : mode === "signin"
              ? "Đăng nhập"
              : "Đăng ký"}
          </button>
        </form>
        <div className="text-center mt-4 text-gray-400">
          {mode === "signin" ? (
            <>
              Chưa có tài khoản?{" "}
              <button
                className="text-primary-pink hover:underline"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
              >
                Đăng ký
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{" "}
              <button
                className="text-primary-pink hover:underline"
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
              >
                Đăng nhập
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
