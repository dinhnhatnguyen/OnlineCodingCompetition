import React, { useState } from "react";
import { signIn, signUp } from "../../api/authApi";

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

  if (!show) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "signup") {
        if (form.password !== form.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
        const res = await signUp({
          username: form.username,
          email: form.email,
          password: form.password,
        });
        if (res.message === "User registered successfully!") {
          showMessage("Sign up successful! Please sign in.", "success");
          setTimeout(() => {
            setMode("signin");
            setForm({
              username: "",
              email: "",
              password: "",
              confirmPassword: "",
            });
          }, 2000);
        } else {
          setError(res.message);
        }
      } else {
        const res = await signIn({
          username: form.username,
          password: form.password,
        });
        if (res.token) {
          onSuccess(res);
        } else {
          setError("Invalid username or password");
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong!");
      }
    }
    setLoading(false);
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
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Username</label>
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
            <label className="block mb-1">Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-2 rounded bg-zinc-800 text-white"
              required
            />
          </div>
          {mode === "signup" && (
            <div>
              <label className="block mb-1">Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 rounded bg-zinc-800 text-white"
                required
              />
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
            {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>
        <div className="text-center mt-4 text-gray-400">
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                className="text-primary-pink hover:underline"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                className="text-primary-pink hover:underline"
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
