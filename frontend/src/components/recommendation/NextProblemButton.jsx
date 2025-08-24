import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNextRandomProblem,
  getRandomProblemFromList,
} from "../../api/recommendationApi";
import { getProblems } from "../../api/problemsApi";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNotification } from "../../contexts/NotificationContext";

/**
 * Component for "Next Problem" button with smart recommendation
 * Component nút "Bài tiếp theo" với gợi ý thông minh
 */
const NextProblemButton = ({
  problemTitle,
  currentProblemId,
  contestId = null,
  className = "",
  variant = "primary", // primary, secondary, outline
  size = "medium", // small, medium, large
  showIcon = true,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const { showNotification } = useNotification();

  const getTexts = () => {
    if (currentLanguage === "vi") {
      return {
        nextProblem: "Bài tiếp theo",
        loading: "Đang tìm...",
        noProblemsFound: "Không tìm thấy bài toán nào",
        errorMessage: "Lỗi khi tìm bài toán tiếp theo",
        foundSimilar: "Đã tìm thấy bài toán tương tự!",
        foundRandom: "Đã tìm thấy bài toán ngẫu nhiên!",
      };
    } else {
      return {
        nextProblem: "Next Problem",
        loading: "Finding...",
        noProblemsFound: "No problems found",
        errorMessage: "Error finding next problem",
        foundSimilar: "Found similar problem!",
        foundRandom: "Found random problem!",
      };
    }
  };

  const texts = getTexts();

  const handleNextProblem = async () => {
    if (disabled || loading) return;

    setLoading(true);

    try {
      // First try to get next problem from similar problems
      const result = await getNextRandomProblem(problemTitle);

      if (result.success && result.problem) {
        // Successfully got a similar problem
        const nextProblemId = result.problem.id;
        showNotification(texts.foundSimilar, "success");

        // Navigate to the next problem
        if (contestId) {
          navigate(`/contests/${contestId}/problems/${nextProblemId}`);
        } else {
          navigate(`/problems/${nextProblemId}`);
        }
        return;
      }

      // Fallback: Get random problem from all problems
      console.log("Falling back to random problem from all problems");
      await handleFallbackRandomProblem();
    } catch (error) {
      console.error("Error getting next problem:", error);
      showNotification(texts.errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackRandomProblem = async () => {
    try {
      console.log("Fallback: Getting random problem from all problems");

      // Get all problems
      const allProblems = await getProblems(currentLanguage);

      if (!allProblems || allProblems.length === 0) {
        showNotification(texts.noProblemsFound, "warning");
        return;
      }

      // Filter out current problem and ensure we have valid problems
      const availableProblems = allProblems.filter(
        (problem) =>
          problem.id !== currentProblemId && problem.id && problem.title
      );

      console.log(
        `Found ${availableProblems.length} available problems for fallback`
      );

      if (availableProblems.length === 0) {
        showNotification(texts.noProblemsFound, "warning");
        return;
      }

      // Get random problem
      const randomProblem = getRandomProblemFromList(availableProblems);

      if (randomProblem) {
        console.log(
          `Selected fallback problem: ${randomProblem.title} (ID: ${randomProblem.id})`
        );
        showNotification(texts.foundRandom, "success");

        // Navigate to the random problem
        if (contestId) {
          navigate(`/contests/${contestId}/problems/${randomProblem.id}`);
        } else {
          navigate(`/problems/${randomProblem.id}`);
        }
      } else {
        showNotification(texts.noProblemsFound, "warning");
      }
    } catch (error) {
      console.error("Error in fallback random problem:", error);
      showNotification(texts.errorMessage, "error");
    }
  };

  // Button styling based on variant and size
  const getButtonClasses = () => {
    let baseClasses =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 shadow-lg hover:shadow-xl transform hover:scale-105";

    // Size classes
    const sizeClasses = {
      small: "px-3 py-1.5 text-sm",
      medium: "px-5 py-2.5 text-sm",
      large: "px-6 py-3 text-base",
    };

    // Variant classes with dark theme
    const variantClasses = {
      primary:
        "bg-gradient-to-r from-[#722055] to-pink-600 text-white hover:from-[#8b2a5b] hover:to-pink-700 focus:ring-[#722055] disabled:from-slate-600 disabled:to-slate-700 disabled:opacity-50 hover:shadow-[#722055]/25",
      secondary:
        "bg-gradient-to-r from-slate-700 to-slate-800 text-white hover:from-slate-600 hover:to-slate-700 focus:ring-slate-500 disabled:opacity-50 border border-slate-600/50",
      outline:
        "border-2 border-[#722055]/50 text-[#722055] hover:bg-[#722055]/10 focus:ring-[#722055] disabled:border-slate-600 disabled:text-slate-500 backdrop-blur-sm bg-slate-800/30",
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;
  };

  const getIconSize = () => {
    const iconSizes = {
      small: "w-4 h-4",
      medium: "w-5 h-5",
      large: "w-6 h-6",
    };
    return iconSizes[size];
  };

  return (
    <button
      onClick={handleNextProblem}
      disabled={disabled || loading || !problemTitle}
      className={getButtonClasses()}
      title={loading ? texts.loading : texts.nextProblem}
    >
      {loading ? (
        <>
          <svg
            className={`animate-spin ${getIconSize()} ${
              showIcon ? "mr-2" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {texts.loading}
        </>
      ) : (
        <>
          {showIcon && (
            <svg
              className={`${getIconSize()} mr-2`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {texts.nextProblem}
        </>
      )}
    </button>
  );
};

export default NextProblemButton;
