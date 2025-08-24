import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { getProblems, getProblemById } from "../api/problemsApi";
import { submitCode, pollSubmissionStatus } from "../api/submissionApi";
import MonacoEditor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "../components/common/LanguageSwitcher";
import SimilarProblems from "../components/recommendation/SimilarProblems";
import NextProblemButton from "../components/recommendation/NextProblemButton";
import axios from "axios";

const languageMap = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp",
};

const getTemplate = (problem, lang) => {
  if (!problem || !problem.functionSignatures) return "";
  const sig = problem.functionSignatures[lang];
  if (!sig) return "";
  let parsed = sig;
  if (typeof sig === "string") {
    try {
      parsed = JSON.parse(sig);
    } catch {
      return "";
    }
  }
  const paramTypes = parsed.parameterTypes || [];
  // Sinh tên biến tự động: a, b, c, ...
  const paramNames = paramTypes.map((_, i) => String.fromCharCode(97 + i));
  switch (lang) {
    case "javascript":
      return `function ${parsed.functionName}(${paramNames.join(
        ", "
      )}) {\n    // Write your code here\n}`;
    case "python":
      // Thêm annotation kiểu dữ liệu
      return `def ${parsed.functionName}(${paramNames
        .map((name, i) => `${name}: ${paramTypes[i]}`)
        .join(", ")}):\n    # Write your code here`;
    case "java":
      return `public class Solution {\n    public ${parsed.returnType} ${
        parsed.functionName
      }(${paramTypes
        .map((type, i) => `${type} ${paramNames[i]}`)
        .join(", ")}) {\n        // Write your code here\n    }\n}`;
    case "cpp":
      return `${parsed.returnType} ${parsed.functionName}(${paramTypes
        .map((type, i) => `${type} ${paramNames[i]}`)
        .join(", ")}) {\n    // Write your code here\n}`;
    default:
      return "";
  }
};

const ContestProblemDetails = () => {
  const { id, contestId } = useParams();
  const location = useLocation();
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const { currentLanguage } = useLanguage();
  const [problem, setProblem] = useState(null);
  const [contestTitle, setContestTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  // States for submission
  const [submitResults, setSubmitResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // States for resizable layout
  const [leftWidth, setLeftWidth] = useState(40); // percentage
  const [isResizing, setIsResizing] = useState(false);

  // Lấy thông tin từ location state nếu có
  useEffect(() => {
    if (location.state?.contestTitle) {
      setContestTitle(location.state.contestTitle);
    } else {
      // Nếu không có state, có thể fetch thông tin contest từ API
      const fetchContestTitle = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8080/api/contests/${contestId}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          );
          setContestTitle(response.data.title);
        } catch (error) {
          console.error("Error fetching contest title:", error);
        }
      };

      fetchContestTitle();
    }
  }, [contestId, location.state, token]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        // Show different loading states
        if (problem) {
          setTranslating(true);
        } else {
          setLoading(true);
        }

        // Use getProblemById with translation support
        const problemData = await getProblemById(id, currentLanguage);

        // Validate problem data
        if (!problemData) {
          throw new Error("No problem data received");
        }

        setProblem(problemData);

        if (problemData && problemData.functionSignatures) {
          setLanguage(
            Object.keys(problemData.functionSignatures)[0] || "javascript"
          );
        }
        setError(null); // Clear any previous errors
        setLoading(false);
        setTranslating(false);
      } catch (error) {
        console.error("Error loading problem:", error);
        const errorMessage =
          currentLanguage === "vi"
            ? "Không thể tải bài toán"
            : "Failed to load problem";
        setError(errorMessage);
        setLoading(false);
        setTranslating(false);
      }
    };

    fetchProblem();
  }, [id, currentLanguage]); // Re-fetch when language changes

  useEffect(() => {
    if (problem) {
      setCode(getTemplate(problem, language));
    }
  }, [problem, language]);

  // Handle mouse events for resizing
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const container = document.querySelector(".flex.flex-col.xl\\:flex-row");
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Limit the width between 20% and 80%
      if (newLeftWidth >= 20 && newLeftWidth <= 80) {
        setLeftWidth(newLeftWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  // Removed run code functionality

  // Submit solution for contest problem
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitResults(null);
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!code.trim()) {
        throw new Error("Vui lòng nhập code trước khi nộp bài");
      }

      const payload = {
        problemId: problem.id,
        language,
        sourceCode: code,
        contestId: parseInt(contestId, 10),
        token: token,
      };

      console.log("Submitting with payload:", payload);

      // Gửi bài và đợi kết quả
      const response = await submitCode(payload);
      console.log("Initial submission response:", response);

      // Poll for submission results
      const result = await pollSubmissionStatus(response.id);
      console.log("Final submission result:", result);

      setSubmitResults(result);

      // Thông báo kết quả
      if (result.status === "ACCEPTED") {
        showNotification(
          "Bài của bạn đã được chấp nhận! Điểm số của bạn sẽ được cập nhật trên bảng xếp hạng.",
          "success"
        );
      } else if (result.status === "COMPILE_ERROR") {
        showNotification(
          `Lỗi biên dịch: ${
            result.compileError || "Vui lòng kiểm tra code của bạn!"
          }`,
          "error"
        );
      } else {
        showNotification(`Kết quả chấm bài: ${result.status}`, "warning");
      }
    } catch (error) {
      console.error("Submit error:", error);

      // Xử lý thông báo lỗi
      const errorMessage =
        error.response?.data?.error || error.message || "Nộp bài thất bại";
      showNotification(errorMessage, "error");

      setSubmitResults({
        status: "ERROR",
        error: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
            {currentLanguage === "vi" ? "Đang tải..." : "Loading..."}
          </div>
        </div>
        <Footer />
      </div>
    );

  if (error || !problem)
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center text-red-500">
            {currentLanguage === "vi"
              ? "Không tìm thấy bài toán"
              : "Problem not found"}
          </div>
        </div>
        <Footer />
      </div>
    );

  // Badge màu cho độ khó
  const getDifficultyBadge = (difficulty) => {
    switch ((difficulty || "").toLowerCase()) {
      case "easy":
        return (
          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs ml-2">
            EASY
          </span>
        );
      case "medium":
        return (
          <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs ml-2">
            MEDIUM
          </span>
        );
      case "hard":
        return (
          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs ml-2">
            HARD
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ACCEPTED":
        return (
          <span className="bg-green-600 text-white px-3 py-1 rounded mr-2">
            ACCEPTED
          </span>
        );
      case "WRONG_ANSWER":
        return (
          <span className="bg-red-600 text-white px-3 py-1 rounded mr-2">
            WRONG ANSWER
          </span>
        );
      case "TIME_LIMIT_EXCEEDED":
        return (
          <span className="bg-yellow-600 text-white px-3 py-1 rounded mr-2">
            TIME LIMIT EXCEEDED
          </span>
        );
      case "MEMORY_LIMIT_EXCEEDED":
        return (
          <span className="bg-yellow-600 text-white px-3 py-1 rounded mr-2">
            MEMORY LIMIT EXCEEDED
          </span>
        );
      case "RUNTIME_ERROR":
        return (
          <span className="bg-red-600 text-white px-3 py-1 rounded mr-2">
            RUNTIME ERROR
          </span>
        );
      case "COMPILE_ERROR":
        return (
          <span className="bg-red-600 text-white px-3 py-1 rounded mr-2">
            COMPILE ERROR
          </span>
        );
      default:
        return (
          <span className="bg-gray-600 text-white px-3 py-1 rounded mr-2">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-4 sm:py-8 text-white max-w-7xl overflow-x-hidden">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <Link
                to={`/contests/${contestId}?tab=problems`}
                className="inline-flex items-center text-gray-400 hover:text-white mb-2 transition-colors"
              >
                &larr; {currentLanguage === "vi" ? "Quay lại" : "Back to"}{" "}
                <span className="truncate ml-1">{contestTitle}</span>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center flex-wrap gap-2">
                <span className="break-words">{problem.title}</span>
                {getDifficultyBadge(problem.difficulty)}
              </h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-gray-400 text-sm whitespace-nowrap">
                {currentLanguage === "vi" ? "Ngôn ngữ:" : "Language:"}
              </span>
              <LanguageSwitcher variant="compact" size="small" />
              {translating && (
                <div className="flex items-center text-blue-400 text-sm whitespace-nowrap ml-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400 mr-1"></div>
                  {currentLanguage === "vi" ? "Đang dịch..." : "Translating..."}
                </div>
              )}
            </div>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">
              {currentLanguage === "vi"
                ? "Đang giải trong cuộc thi:"
                : "Solving in contest:"}{" "}
              <span className="text-primary-pink">{contestTitle}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-0 xl:gap-1 h-[calc(100vh-200px)] min-h-[600px]">
          {/* Problem Description */}
          <div
            className="bg-zinc-900 p-4 rounded-lg overflow-y-auto mb-4 xl:mb-0 flex-shrink-0"
            style={{
              width: window.innerWidth >= 1280 ? `${leftWidth}%` : "100%",
              minHeight: window.innerWidth >= 1280 ? "100%" : "400px",
              maxHeight: window.innerWidth >= 1280 ? "100%" : "400px",
            }}
          >
            {/* Translation Notice - Only show for Vietnamese and when content is actually translated */}
            {currentLanguage === "vi" && !translating && problem && (
              <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                <div className="flex items-center text-blue-300 text-sm">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Nội dung đã được dịch tự động từ tiếng Anh
                </div>
              </div>
            )}

            {/* Translation Loading Notice */}
            {translating && (
              <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                <div className="flex items-center text-yellow-300 text-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-300 mr-2"></div>
                  {currentLanguage === "vi"
                    ? "Đang dịch nội dung..."
                    : "Translating content..."}
                </div>
              </div>
            )}

            {/* Main Problem Description */}
            <div className="mb-4">
              <div className="prose prose-invert text-white max-w-none w-full">
                <ReactMarkdown
                  components={{
                    p: (props) => (
                      <p
                        className="text-white mb-3 xl:mb-4 leading-relaxed text-sm xl:text-base break-words"
                        {...props}
                      />
                    ),
                    h1: (props) => (
                      <h1
                        className="text-white text-lg xl:text-2xl font-bold mb-3 xl:mb-4 border-b border-zinc-700 pb-2 break-words"
                        {...props}
                      />
                    ),
                    h2: (props) => (
                      <h2
                        className="text-white text-base xl:text-xl font-bold mb-2 xl:mb-3 border-b border-zinc-700 pb-1 break-words"
                        {...props}
                      />
                    ),
                    h3: (props) => (
                      <h3
                        className="text-white text-sm xl:text-lg font-bold mb-2 break-words"
                        {...props}
                      />
                    ),
                    h4: (props) => (
                      <h4
                        className="text-white text-sm xl:text-base font-bold mb-2 break-words"
                        {...props}
                      />
                    ),
                    ul: (props) => (
                      <ul
                        className="text-white list-disc ml-4 xl:ml-6 mb-3 xl:mb-4 space-y-1 text-sm xl:text-base"
                        {...props}
                      />
                    ),
                    ol: (props) => (
                      <ol
                        className="text-white list-decimal ml-4 xl:ml-6 mb-3 xl:mb-4 space-y-1 text-sm xl:text-base"
                        {...props}
                      />
                    ),
                    li: (props) => (
                      <li
                        className="text-white leading-relaxed break-words"
                        {...props}
                      />
                    ),
                    code: (props) => (
                      <code
                        className="bg-zinc-800 text-yellow-300 px-1 xl:px-2 py-0.5 xl:py-1 rounded text-xs xl:text-sm font-mono break-all"
                        {...props}
                      />
                    ),
                    pre: (props) => (
                      <pre
                        className="bg-zinc-800 text-white p-2 xl:p-4 rounded-lg mb-3 xl:mb-4 overflow-x-auto border border-zinc-700 text-xs xl:text-sm"
                        {...props}
                      />
                    ),
                    blockquote: (props) => (
                      <blockquote
                        className="border-l-4 border-blue-500 pl-4 italic text-gray-300 mb-4"
                        {...props}
                      />
                    ),
                    table: (props) => (
                      <div className="overflow-x-auto mb-4">
                        <table
                          className="min-w-full border border-zinc-700 rounded-lg"
                          {...props}
                        />
                      </div>
                    ),
                    thead: (props) => (
                      <thead className="bg-zinc-800" {...props} />
                    ),
                    tbody: (props) => (
                      <tbody className="bg-zinc-900" {...props} />
                    ),
                    tr: (props) => (
                      <tr className="border-b border-zinc-700" {...props} />
                    ),
                    th: (props) => (
                      <th
                        className="px-4 py-2 text-left font-bold text-white"
                        {...props}
                      />
                    ),
                    td: (props) => (
                      <td className="px-4 py-2 text-white" {...props} />
                    ),
                    strong: (props) => (
                      <strong className="font-bold text-white" {...props} />
                    ),
                    em: (props) => (
                      <em className="italic text-gray-300" {...props} />
                    ),
                    hr: (props) => (
                      <hr className="border-zinc-700 my-6" {...props} />
                    ),
                  }}
                >
                  {problem.description || ""}
                </ReactMarkdown>
              </div>
            </div>

            {/* Input/Output Section */}
            <div className="mb-4">
              <h3 className="font-bold mb-2 text-sm xl:text-base text-white">
                {currentLanguage === "vi" ? "Đầu vào" : "Input"}
              </h3>
              <div className="mb-3 xl:mb-4 p-3 bg-zinc-800 rounded border border-zinc-700">
                <p className="text-gray-300 text-sm xl:text-base leading-relaxed break-words">
                  {problem.inputDescription ||
                    (currentLanguage === "vi"
                      ? "Hai số nguyên a và b (-10^9 ≤ a, b ≤ 10^9)."
                      : "Two integers a and b (-10^9 ≤ a, b ≤ 10^9).")}
                </p>
              </div>

              <h3 className="font-bold mb-2 text-sm xl:text-base text-white">
                {currentLanguage === "vi" ? "Đầu ra" : "Output"}
              </h3>
              <div className="mb-3 xl:mb-4 p-3 bg-zinc-800 rounded border border-zinc-700">
                <p className="text-gray-300 text-sm xl:text-base leading-relaxed break-words">
                  {problem.outputDescription ||
                    (currentLanguage === "vi"
                      ? "Tổng của hai số a và b."
                      : "The sum of two numbers a and b.")}
                </p>
              </div>
            </div>

            {/* Examples Section */}
            <div className="mb-4">
              <h3 className="font-bold mb-2 text-sm xl:text-base text-white">
                {currentLanguage === "vi" ? "Ví dụ" : "Example"}
              </h3>
              {(problem.testCases || [])
                .filter((tc) => tc.isExample)
                .map((testCase, index) => {
                  let input = "";
                  let output = "";
                  try {
                    const inputArr = JSON.parse(testCase.inputData);
                    input = inputArr.map((i) => i.input).join(", ");
                    const outputObj = JSON.parse(testCase.expectedOutputData);
                    output = outputObj.expectedOutput;
                  } catch {
                    input = testCase.input;
                    output = testCase.expectedOutput;
                  }

                  return (
                    <div
                      key={testCase.id}
                      className="mb-3 bg-zinc-800 p-3 xl:p-4 rounded border border-zinc-700"
                    >
                      {(problem.testCases || []).filter((tc) => tc.isExample)
                        .length > 1 && (
                        <div className="mb-2">
                          <span className="text-white font-semibold text-xs xl:text-sm">
                            {currentLanguage === "vi"
                              ? `Ví dụ ${index + 1}:`
                              : `Example ${index + 1}:`}
                          </span>
                        </div>
                      )}
                      <div className="mb-2">
                        <span className="font-bold text-blue-300 text-xs xl:text-sm">
                          {currentLanguage === "vi" ? "Đầu vào:" : "Input:"}
                        </span>
                        <div className="mt-1">
                          <span className="break-all text-xs xl:text-sm font-mono bg-zinc-900 px-2 py-1 rounded block">
                            {input}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-green-300 text-xs xl:text-sm">
                          {currentLanguage === "vi" ? "Đầu ra:" : "Output:"}
                        </span>
                        <div className="mt-1">
                          <span className="break-all text-xs xl:text-sm font-mono bg-zinc-900 px-2 py-1 rounded block">
                            {output}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Topics Section */}
            {problem.topics && problem.topics.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold mb-2 text-sm xl:text-base text-white">
                  {currentLanguage === "vi" ? "Chủ đề:" : "Topics:"}
                </h3>
                <div className="flex flex-wrap gap-1 xl:gap-2">
                  {problem.topics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="bg-zinc-800 border border-zinc-700 rounded px-2 xl:px-3 py-1 xl:py-1.5 text-xs xl:text-sm break-words text-white"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints Section */}
            {problem.constraints && (
              <div className="mb-4">
                <h3 className="font-bold mb-2 text-sm xl:text-base text-white">
                  {currentLanguage === "vi" ? "Ràng buộc:" : "Constraints:"}
                </h3>
                <div className="p-3 bg-zinc-800 rounded border border-zinc-700">
                  <div className="prose prose-invert text-white max-w-none w-full">
                    <ReactMarkdown
                      components={{
                        p: (props) => (
                          <p
                            className="text-gray-300 mb-2 leading-relaxed text-sm xl:text-base break-words"
                            {...props}
                          />
                        ),
                        ul: (props) => (
                          <ul
                            className="text-gray-300 list-disc ml-4 xl:ml-6 mb-2 space-y-1 text-sm xl:text-base"
                            {...props}
                          />
                        ),
                        ol: (props) => (
                          <ol
                            className="text-gray-300 list-decimal ml-4 xl:ml-6 mb-2 space-y-1 text-sm xl:text-base"
                            {...props}
                          />
                        ),
                        li: (props) => (
                          <li
                            className="text-gray-300 leading-relaxed break-words"
                            {...props}
                          />
                        ),
                        code: (props) => (
                          <code
                            className="bg-zinc-900 text-yellow-300 px-1 xl:px-2 py-0.5 xl:py-1 rounded text-xs xl:text-sm font-mono break-all"
                            {...props}
                          />
                        ),
                        pre: (props) => (
                          <pre
                            className="bg-zinc-900 text-white p-2 xl:p-4 rounded-lg mb-3 xl:mb-4 overflow-x-auto border border-zinc-600 text-xs xl:text-sm"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {problem.constraints || ""}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resizer Bar - Only show on desktop */}
          <div
            className="hidden xl:block w-1 bg-zinc-700 hover:bg-zinc-600 cursor-col-resize transition-colors"
            onMouseDown={handleMouseDown}
            title="Drag to resize"
          />

          {/* Code Editor and Results */}
          <div
            className="bg-zinc-900 rounded-lg overflow-hidden flex-1 min-w-0"
            style={{
              width: window.innerWidth >= 1280 ? `${100 - leftWidth}%` : "100%",
              minHeight: window.innerWidth >= 1280 ? "100%" : "500px",
            }}
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 xl:mb-4 gap-2">
                <h2 className="text-base xl:text-lg font-bold">
                  {currentLanguage === "vi" ? "Trình soạn thảo" : "Code Editor"}
                </h2>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-zinc-800 text-white px-2 xl:px-3 py-1 xl:py-2 rounded border border-zinc-700 text-xs xl:text-sm"
                >
                  {problem.functionSignatures &&
                    Object.keys(problem.functionSignatures).map((lang) => (
                      <option key={lang} value={lang}>
                        {lang === "cpp"
                          ? "C++"
                          : lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                </select>
              </div>
              <div className="border border-zinc-700 rounded-lg flex-1 mb-3 xl:mb-4 min-h-[250px] xl:min-h-[300px]">
                <MonacoEditor
                  height="100%"
                  language={languageMap[language] || "javascript"}
                  value={code}
                  onChange={setCode}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: window.innerWidth >= 1280 ? 14 : 12,
                    wordWrap: "on",
                    automaticLayout: true,
                    lineNumbers: "on",
                    renderWhitespace: "selection",
                    tabSize: 2,
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`flex-1 px-3 xl:px-4 py-2 xl:py-3 rounded-lg font-medium transition-colors text-sm xl:text-base ${
                    submitting
                      ? "bg-green-800 text-gray-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {submitting
                    ? currentLanguage === "vi"
                      ? "Đang nộp bài..."
                      : "Submitting..."
                    : currentLanguage === "vi"
                    ? "Nộp bài"
                    : "Submit"}
                </button>

                {/* Next Problem Button - Show after successful submission or always for contest */}
                {/* {(submitResults?.status === "ACCEPTED" || true) && (
                  <NextProblemButton
                    problemTitle={problem.title}
                    currentProblemId={parseInt(id)}
                    contestId={parseInt(contestId)}
                    size="medium"
                    variant="outline"
                    className="flex-shrink-0"
                  />
                )} */}
              </div>

              {submitResults && (
                <div className="mt-3 xl:mt-4 p-3 xl:p-4 border border-zinc-700 rounded-lg">
                  <h3 className="text-base xl:text-lg font-semibold mb-2">
                    {currentLanguage === "vi"
                      ? "Kết quả nộp bài:"
                      : "Submission Results:"}
                  </h3>
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="font-semibold mr-2">Status:</span>
                      {getStatusBadge(submitResults.status)}
                    </div>

                    {submitResults.passedTestCases !== undefined && (
                      <div className="mb-2">
                        <span>
                          Passed: {submitResults.passedTestCases}/
                          {submitResults.totalTestCases} test cases
                        </span>
                      </div>
                    )}

                    {submitResults.runtime !== undefined && (
                      <div className="mb-2">
                        <span>Runtime: {submitResults.runtime}ms</span>
                      </div>
                    )}

                    {submitResults.memory !== undefined && (
                      <div className="mb-2">
                        <span>Memory: {submitResults.memory}KB</span>
                      </div>
                    )}

                    {submitResults.score !== undefined && (
                      <div className="font-semibold text-primary-pink">
                        Điểm: {submitResults.score.toFixed(2)}
                      </div>
                    )}

                    {submitResults.compileError && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-1 text-red-500">
                          Lỗi biên dịch:
                        </h4>
                        <pre className="whitespace-pre-wrap bg-zinc-800 p-2 rounded text-red-400">
                          {submitResults.compileError}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Similar Problems Section - Only show for contest problems */}
      <div className="container mx-auto px-4 pb-8 max-w-7xl">
        <SimilarProblems
          problemTitle={problem.title}
          currentProblemId={parseInt(id)}
          contestId={parseInt(contestId)}
          maxRecommendations={5}
          className="mb-8"
        />
      </div>

      <Footer />
    </div>
  );
};

export default ContestProblemDetails;
