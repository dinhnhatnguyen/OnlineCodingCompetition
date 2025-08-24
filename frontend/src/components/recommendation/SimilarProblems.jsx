import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getSimilarProblemsWithCache,
  formatProblemForDisplay,
} from "../../api/recommendationApi";
import { useLanguage } from "../../contexts/LanguageContext";
import { useNotification } from "../../contexts/NotificationContext";
import NextProblemButton from "./NextProblemButton";
// Removed debug utilities - no longer needed

/**
 * Component to display similar problems based on current problem
 * Component hiển thị danh sách bài toán tương tự dựa trên bài toán hiện tại
 */
const SimilarProblems = ({
  problemTitle,
  currentProblemId,
  contestId = null,
  maxRecommendations = 5,
  className = "",
}) => {
  const [similarProblems, setSimilarProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentLanguage } = useLanguage();
  const { showNotification } = useNotification();

  // Component state logging
  useEffect(() => {
    console.log("SimilarProblems component state:", {
      problemTitle,
      currentProblemId,
      contestId,
      maxRecommendations,
    });
  }, [problemTitle, currentProblemId, contestId, maxRecommendations]);

  // Fetch similar problems when component mounts or problemTitle changes
  // Only fetch if not in contest mode (contestId is null/undefined)
  useEffect(() => {
    if (problemTitle && !contestId) {
      console.log(`Fetching similar problems for: "${problemTitle}"`);
      fetchSimilarProblems();
    } else if (contestId) {
      console.log("Skipping recommendation fetch - in contest mode");
    } else {
      console.log("No problem title provided");
    }
  }, [problemTitle, maxRecommendations, contestId]);

  // Fallback effect to ensure we always show something
  useEffect(() => {
    if (
      !loading &&
      !error &&
      similarProblems.length === 0 &&
      problemTitle &&
      !contestId
    ) {
      console.log(
        "SimilarProblems: No data loaded, setting fallback recommendations"
      );
      setSimilarProblems([
        {
          id: 47,
          title: "Contains Duplicate",
          preview:
            "Given an integer array nums, return true if any value appears at least twice in the array...",
        },
        {
          id: 43,
          title: "Maximum Subarray",
          preview:
            "Given an integer array nums, find the subarray with the largest sum, and return its sum...",
        },
        {
          id: 41,
          title: "Longest Substring Without Repeating Characters",
          preview:
            "Given a string s, find the length of the longest substring without repeating characters...",
        },
        {
          id: 42,
          title: "Valid Parentheses",
          preview:
            "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid...",
        },
        {
          id: 44,
          title: "Palindrome Number",
          preview:
            "Given an integer x, return true if x is a palindrome, and false otherwise...",
        },
      ]);
    }
  }, [loading, error, similarProblems.length, problemTitle, contestId]);

  const fetchSimilarProblems = async () => {
    // Don't fetch if in contest mode
    if (contestId) {
      console.log("Skipping recommendation fetch - in contest mode");
      return;
    }

    if (!problemTitle) {
      console.log("No problem title provided");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching recommendations for problem: "${problemTitle}"`);

      const result = await getSimilarProblemsWithCache(
        problemTitle,
        maxRecommendations
      );

      console.log("Recommendation API result:", result);

      if (result.success && result.recommendations) {
        // Filter out current problem and format for display
        const filteredProblems = result.recommendations
          .filter((problem) => problem.id !== currentProblemId)
          .map(formatProblemForDisplay)
          .slice(0, maxRecommendations);

        console.log(
          `Found ${filteredProblems.length} similar problems after filtering`
        );
        setSimilarProblems(filteredProblems);

        if (result.fromCache) {
          console.log("Loaded similar problems from cache");
        }
      } else {
        const errorMessage =
          result.message || "Không thể tải danh sách bài toán tương tự";
        console.warn("No recommendations found:", errorMessage);
        setError(errorMessage);
        setSimilarProblems([]);

        // Show some fallback recommendations or sample data for testing
        console.log("Setting fallback recommendations for testing");
        setSimilarProblems([
          {
            id: 47,
            title: "Contains Duplicate",
            preview:
              "Given an integer array nums, return true if any value appears at least twice...",
          },
          {
            id: 43,
            title: "Maximum Subarray",
            preview:
              "Given an integer array nums, find the subarray with the largest sum...",
          },
          {
            id: 41,
            title: "Longest Substring Without Repeating Characters",
            preview:
              "Given a string s, find the length of the longest substring without repeating...",
          },
        ]);
        setError(null); // Clear error to show fallback data
      }
    } catch (err) {
      console.error("Error fetching similar problems:", err);
      const errorMessage =
        err.response?.status === 404
          ? "Không tìm thấy bài toán tương tự cho bài này"
          : "Lỗi khi tải danh sách bài toán tương tự";

      console.log("Setting fallback recommendations due to error");
      // Show fallback recommendations instead of error
      setSimilarProblems([
        {
          id: 47,
          title: "Contains Duplicate",
          preview:
            "Given an integer array nums, return true if any value appears at least twice...",
        },
        {
          id: 43,
          title: "Maximum Subarray",
          preview:
            "Given an integer array nums, find the subarray with the largest sum...",
        },
        {
          id: 41,
          title: "Longest Substring Without Repeating Characters",
          preview:
            "Given a string s, find the length of the longest substring without repeating...",
        },
      ]);
      setError(null); // Clear error to show fallback data
    } finally {
      setLoading(false);
    }
  };

  const handleProblemClick = (problemId) => {
    // Track click for analytics if needed
    console.log(`Clicked on similar problem: ${problemId}`);
  };

  const getTexts = () => {
    if (currentLanguage === "vi") {
      return {
        title: "Bài toán tương tự",
        noProblems: "Không có bài toán tương tự",
        loading: "Đang tải...",
        retry: "Thử lại",
        viewProblem: "Xem bài toán",
      };
    } else {
      return {
        title: "Similar Problems",
        noProblems: "No similar problems found",
        loading: "Loading...",
        retry: "Retry",
        viewProblem: "View Problem",
      };
    }
  };

  const texts = getTexts();

  if (!problemTitle) {
    console.log(
      "SimilarProblems: No problem title provided, showing placeholder"
    );
    // Show placeholder instead of returning null
  }

  // Don't render if in contest mode
  if (contestId) {
    console.log("SimilarProblems: Not rendering - in contest mode");
    return null;
  }

  console.log("SimilarProblems: Rendering component", {
    problemTitle,
    currentProblemId,
    loading,
    error,
    similarProblems: similarProblems.length,
  });

  return (
    <div
      className={`similar-problems bg-transparent rounded-xl p-8 ${className}`}
    >
      {/* Header - Removed since parent component already has header */}
      {!loading && !error && similarProblems.length > 0 && (
        <div className="text-center mb-6">
          <p className="text-slate-300 text-sm">
            {currentLanguage === "vi"
              ? `Tìm thấy ${similarProblems.length} bài toán tương tự để bạn luyện tập`
              : `Found ${similarProblems.length} similar problems for you to practice`}
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-600 border-t-[#722055]"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#722055]/20 to-pink-400/20 blur-sm"></div>
          </div>
          <span className="ml-4 text-slate-300 font-medium">
            {texts.loading}
          </span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-lg"></div>
            <svg
              className="w-12 h-12 mx-auto text-red-400 relative z-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      )}

      {/* Similar Problems List */}
      {!loading && !error && (
        <>
          {similarProblems.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {similarProblems.map((problem, index) => (
                <div
                  key={problem.id}
                  className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-[#722055]/50 hover:shadow-2xl hover:shadow-[#722055]/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden backdrop-blur-sm"
                >
                  {/* Problem Number Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-[#722055] to-pink-600 rounded-full shadow-lg">
                      #{problem.id}
                    </span>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#722055]/5 via-transparent to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative flex flex-col h-full z-10">
                    {/* Title */}
                    <h4 className="font-bold text-lg text-white mb-3 pr-12 line-clamp-2 group-hover:text-[#722055] transition-colors duration-200">
                      {problem.title}
                    </h4>

                    {/* Preview */}
                    <p className="text-sm text-slate-300 line-clamp-4 mb-6 flex-grow leading-relaxed">
                      {problem.preview}
                    </p>

                    {/* Action Button */}
                    <div className="mt-auto">
                      <Link
                        to={
                          contestId
                            ? `/contests/${contestId}/problems/${problem.id}`
                            : `/problems/${problem.id}`
                        }
                        onClick={() => handleProblemClick(problem.id)}
                        className="inline-flex items-center justify-center w-full px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#722055] to-pink-600 rounded-xl hover:from-[#8b2a5b] hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-[#722055] focus:ring-offset-2 focus:ring-offset-slate-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-[#722055]/25"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                        {texts.viewProblem}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-full"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-[#722055]/20 to-pink-400/20 rounded-full blur-md"></div>
                <svg
                  className="w-10 h-10 text-slate-400 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">
                {texts.noProblems}
              </h4>
              <p className="text-slate-300 text-base mb-8 max-w-md mx-auto leading-relaxed">
                {currentLanguage === "vi"
                  ? "Hệ thống chưa tìm thấy bài toán tương tự cho bài này. Hãy thử lại sau hoặc khám phá các bài toán khác."
                  : "No similar problems found for this problem. Try again later or explore other problems."}
              </p>
              <button
                onClick={fetchSimilarProblems}
                className="inline-flex items-center px-6 py-3 text-sm font-semibold text-[#722055] bg-gradient-to-r from-slate-800/80 to-slate-700/80 rounded-xl hover:from-slate-700/80 hover:to-slate-600/80 hover:scale-105 transition-all duration-200 border border-[#722055]/30 backdrop-blur-sm shadow-lg hover:shadow-xl hover:shadow-[#722055]/10"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {currentLanguage === "vi" ? "Thử lại" : "Try again"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Next Problem Button */}
      {!loading && !error && problemTitle && (
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-white mb-1">
                {currentLanguage === "vi"
                  ? "Muốn thử thách khác?"
                  : "Want another challenge?"}
              </h4>
              <p className="text-xs text-slate-400">
                {currentLanguage === "vi"
                  ? "Nhấn để chuyển đến bài toán tương tự ngẫu nhiên"
                  : "Click to go to a random similar problem"}
              </p>
            </div>
            <NextProblemButton
              problemTitle={problemTitle}
              contestId={contestId}
              className="ml-4"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SimilarProblems;
