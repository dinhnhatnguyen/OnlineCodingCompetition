import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { getProblems } from "../api/problemsApi";
import { submitCode, pollSubmissionStatus } from "../api/submissionApi";
import MonacoEditor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
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
  const [problem, setProblem] = useState(null);
  const [contestTitle, setContestTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  // States for submission
  const [submitResults, setSubmitResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
    getProblems()
      .then((data) => {
        const found = data.find((p) => String(p.id) === String(id));
        setProblem(found);
        setLoading(false);
        if (found) {
          setLanguage(Object.keys(found.functionSignatures)[0] || "javascript");
        }
      })
      .catch(() => {
        setError("Failed to load problem");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (problem) {
      setCode(getTemplate(problem, language));
    }
  }, [problem, language]);

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
    return <div className="text-center py-10 text-white">Đang tải...</div>;
  if (error || !problem)
    return (
      <div className="text-center py-10 text-red-500">
        Không tìm thấy bài toán
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
      <main className="flex-grow container mx-auto px-4 py-8 text-white">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <Link
              to={`/contests/${contestId}?tab=problems`}
              className="flex items-center text-gray-400 hover:text-white mb-2"
            >
              &larr; Quay lại {contestTitle}
            </Link>
            <h1 className="text-2xl font-bold flex items-center">
              {problem.title} {getDifficultyBadge(problem.difficulty)}
            </h1>
          </div>
          <div className="text-sm mt-2 sm:mt-0">
            <span className="text-gray-400">
              Đang giải trong cuộc thi:{" "}
              <span className="text-primary-pink">{contestTitle}</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Problem Description */}
          <div className="lg:col-span-1 bg-zinc-900 p-6 rounded-lg">
            <div className="mb-4">
              <p className="text-lg mb-4">{problem.description}</p>
            </div>

            <div className="mb-4">
              <h3 className="font-bold mb-2">Input</h3>
              <p className="mb-4">
                {problem.inputDescription ||
                  "Hai số nguyên a và b (-10^9 ≤ a, b ≤ 10^9)."}
              </p>

              <h3 className="font-bold mb-2">Output</h3>
              <p className="mb-4">
                {problem.outputDescription || "Tổng của hai số a và b."}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="font-bold mb-2">Example</h3>
              {(problem.testCases || [])
                .filter((tc) => tc.isExample)
                .map((testCase) => {
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
                    <div key={testCase.id} className="mb-3">
                      <div className="mb-1">
                        <span className="font-bold">Input:</span> {input}
                      </div>
                      <div className="mb-2">
                        <span className="font-bold">Output:</span> {output}
                      </div>
                    </div>
                  );
                })}
            </div>

            {problem.topics && problem.topics.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold mb-2">Topics:</h3>
                <div className="flex flex-wrap gap-2">
                  {problem.topics.map((topic, idx) => (
                    <span
                      key={idx}
                      className="bg-zinc-800 rounded px-2 py-1 text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {problem.constraints && (
              <div className="mb-4">
                <h3 className="font-bold mb-2">Constraints:</h3>
                <p className="whitespace-pre-line">{problem.constraints}</p>
              </div>
            )}
          </div>

          {/* Code Editor and Results */}
          <div className="lg:col-span-2">
            <div className="mb-4 bg-zinc-900 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold">Trình soạn thảo</h2>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-zinc-800 text-white px-2 py-1 rounded border border-zinc-700"
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
              <div className="border border-zinc-700 rounded-lg h-[400px]">
                <MonacoEditor
                  height="100%"
                  language={languageMap[language] || "javascript"}
                  value={code}
                  onChange={setCode}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                  }}
                />
              </div>
              <div className="flex mt-4 gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`w-full px-4 py-2 rounded ${
                    submitting
                      ? "bg-green-800 text-gray-300"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {submitting ? "Đang nộp bài..." : "Nộp bài"}
                </button>
              </div>

              {submitResults && (
                <div className="mt-4 p-4 border border-zinc-700 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">
                    Kết quả nộp bài:
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
      <Footer />
    </div>
  );
};

export default ContestProblemDetails;
