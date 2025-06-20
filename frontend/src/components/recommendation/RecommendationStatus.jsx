import React, { useState, useEffect } from "react";
import { checkRecommendationSystemHealth } from "../../api/recommendationApi";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * Component to display recommendation system status
 * Component hiển thị trạng thái hệ thống gợi ý
 */
const RecommendationStatus = ({ className = "" }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const result = await checkRecommendationSystemHealth();
      setStatus(result);
    } catch (error) {
      setStatus({
        available: false,
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getTexts = () => {
    if (currentLanguage === "vi") {
      return {
        systemStatus: "Trạng thái hệ thống gợi ý",
        available: "Khả dụng",
        unavailable: "Không khả dụng",
        checking: "Đang kiểm tra...",
        retry: "Thử lại",
        description: "Hệ thống gợi ý bài toán tương tự",
      };
    } else {
      return {
        systemStatus: "Recommendation System Status",
        available: "Available",
        unavailable: "Unavailable",
        checking: "Checking...",
        retry: "Retry",
        description: "Similar problems recommendation system",
      };
    }
  };

  const texts = getTexts();

  if (loading) {
    return (
      <div
        className={`recommendation-status bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 rounded-xl p-4 backdrop-blur-sm ${className}`}
      >
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-600 border-t-[#722055] mr-3"></div>
          <span className="text-slate-300 text-sm">{texts.checking}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`recommendation-status bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/50 rounded-xl p-4 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-3 shadow-lg ${
              status?.available
                ? "bg-green-500 shadow-green-500/50"
                : "bg-red-500 shadow-red-500/50"
            }`}
          ></div>
          <div>
            <div className="font-semibold text-white text-sm">
              {texts.systemStatus}
            </div>
            <div className="text-slate-300 text-xs">{texts.description}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-3 py-1 rounded-full font-medium ${
              status?.available
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            }`}
          >
            {status?.available ? texts.available : texts.unavailable}
          </span>
          <button
            onClick={checkHealth}
            className="text-xs text-[#722055] hover:text-pink-400 font-semibold transition-colors duration-200"
          >
            {texts.retry}
          </button>
        </div>
      </div>

      {status?.error && (
        <div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
          {status.error}
        </div>
      )}
    </div>
  );
};

export default RecommendationStatus;
