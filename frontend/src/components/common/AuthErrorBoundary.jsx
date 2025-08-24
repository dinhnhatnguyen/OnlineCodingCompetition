import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * Component để wrap các component cần authentication
 * Hiển thị thông báo thân thiện thay vì lỗi console
 */
const AuthErrorBoundary = ({ children, fallback, requireAuth = false }) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const translations = {
    vi: {
      loginRequired: "Vui lòng đăng nhập để xem nội dung này",
      loginButton: "Đăng nhập",
      registerButton: "Đăng ký",
      guestMode: "Bạn đang ở chế độ khách. Một số tính năng có thể bị hạn chế.",
    },
    en: {
      loginRequired: "Please login to view this content",
      loginButton: "Login",
      registerButton: "Register",
      guestMode: "You are in guest mode. Some features may be limited.",
    },
  };

  const t = translations[language];

  // Nếu requireAuth = true và user chưa đăng nhập, hiển thị fallback
  if (requireAuth && !user) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t.loginRequired}
        </h3>
        <div className="flex justify-center space-x-3">
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {t.loginButton}
          </a>
          <a
            href="/register"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {t.registerButton}
          </a>
        </div>
      </div>
    );
  }

  // Nếu không require auth hoặc user đã đăng nhập, render children
  return children;
};

export default AuthErrorBoundary;
