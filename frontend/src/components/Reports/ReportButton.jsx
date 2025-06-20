import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import ReportForm from "./ReportForm";

const ReportButton = ({ problemId, problemTitle }) => {
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showReportForm, setShowReportForm] = useState(false);

  const translations = {
    vi: {
      reportIssue: "Báo cáo lỗi",
      reportTooltip: "Báo cáo lỗi hoặc vấn đề với bài toán này",
      loginRequired: "Vui lòng đăng nhập để báo cáo lỗi",
    },
    en: {
      reportIssue: "Report Issue",
      reportTooltip: "Report an issue or problem with this question",
      loginRequired: "Please login to report an issue",
    },
  };

  const t = translations[currentLanguage] || translations.vi; // Default to Vietnamese

  const handleReportClick = () => {
    if (!user) {
      showToast(t.loginRequired, "warning");
      return;
    }
    setShowReportForm(true);
  };

  const handleReportSuccess = () => {
    setShowReportForm(false);
  };

  return (
    <>
      <button
        onClick={handleReportClick}
        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-400 bg-red-900/20 border border-red-700/50 rounded-md hover:bg-red-900/30 hover:text-red-300 hover:border-red-600/70 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200"
        title={user ? t.reportTooltip : t.loginRequired}
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        {t.reportIssue}
      </button>

      {/* Report Form Modal */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <ReportForm
              problemId={problemId}
              problemTitle={problemTitle}
              onClose={() => setShowReportForm(false)}
              onSuccess={handleReportSuccess}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;
