import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import SimilarProblems from "./SimilarProblems";
import RecommendationStats from "./RecommendationStats";
import RecommendationDebug from "./RecommendationDebug";

/**
 * Comprehensive recommendation section component
 * Component tổng hợp cho phần gợi ý bài toán
 */
const RecommendationSection = ({
  problemTitle,
  currentProblemId,
  contestId = null,
  maxRecommendations = 6,
  showStats = false,
  showDebug = false,
  className = "",
}) => {
  const { currentLanguage } = useLanguage();

  const getTexts = () => {
    if (currentLanguage === "vi") {
      return {
        sectionTitle: "Bài toán tương tự",
        subtitle: "Khám phá các bài toán liên quan để luyện tập thêm",
        poweredBy: "Gợi ý thông minh",
      };
    } else {
      return {
        sectionTitle: "Similar Problems",
        subtitle: "Discover related problems to practice more",
        poweredBy: "Smart Recommendations",
      };
    }
  };

  const texts = getTexts();

  if (!problemTitle) {
    return null;
  }

  return (
    <div
      className={`recommendation-section bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl shadow-slate-900/20 ${className}`}
    >
      {/* Section Header */}
      <div className="mb-6 p-8 pb-0">
        <div className="text-center">
          {/* Title with enhanced styling */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#722055]/20 to-transparent h-px top-1/2 transform -translate-y-1/2"></div>
            <h2 className="text-3xl font-bold text-white mb-3 flex items-center justify-center relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 px-6">
              <div className="flex items-center bg-gradient-to-r from-[#722055] to-[#8b2a5b] bg-clip-text text-transparent">
                <svg
                  className="w-8 h-8 mr-3 text-[#722055] drop-shadow-lg"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  {texts.sectionTitle}
                </span>
              </div>
            </h2>
          </div>

          {/* Subtitle with better contrast */}
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed">
            {texts.subtitle}
          </p>

          {/* Enhanced badge */}
          <div className="mt-4">
            <span className="inline-flex items-center px-5 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[#722055] to-pink-600 text-white backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-[#722055]/25 transition-all duration-300 hover:scale-105">
              <div className="flex items-center">
                <div className="relative mr-3">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-sm"></div>
                  <svg
                    className="w-4 h-4 text-white relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <span className="text-white font-semibold">
                  {texts.poweredBy}
                </span>
              </div>
            </span>
          </div>
        </div>
      </div>

      {/* Decorative divider with gradient */}
      <div className="px-8 mb-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 px-4">
              <div className="w-2 h-2 bg-gradient-to-r from-[#722055] to-pink-400 rounded-full opacity-60"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with enhanced container */}
      <div className="w-full px-4 pb-6">
        <div className="bg-gradient-to-b from-slate-800/20 to-slate-900/30 rounded-xl border border-slate-700/30 backdrop-blur-sm shadow-inner">
          <SimilarProblems
            problemTitle={problemTitle}
            currentProblemId={currentProblemId}
            contestId={contestId}
            maxRecommendations={maxRecommendations}
          />
        </div>
      </div>
    </div>
  );
};

export default RecommendationSection;
