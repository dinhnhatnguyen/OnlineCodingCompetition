import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { getProblemById } from "../api/problemsApi";
import { submitCode, pollSubmissionStatus } from "../api/submissionApi";
import MonacoEditor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import offlineDataCollector from "../services/offlineDataCollector";
import firebaseDebugger from "../utils/firebaseDebugger";
import firebaseLogger from "../utils/firebaseLogger";
import { useCodeEditorTracking } from "../hooks/useCodeEditorTracking";
import { getUserInfo } from "../api/userApi";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import CommentsSection from "../components/Comments/CommentsSection";
import ReportButton from "../components/Reports/ReportButton";

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

const ProblemDetails = () => {
  const { id } = useParams();
  const { currentLanguage } = useLanguage();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  // States for submission
  const [submitResults, setSubmitResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);

  // Enhanced data collection states
  const [sessionId, setSessionId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState(null);

  // States for resizable layout
  const [leftWidth, setLeftWidth] = useState(40); // percentage
  const [isResizing, setIsResizing] = useState(false);

  // Code editor tracking hook
  const { initializeTracking } = useCodeEditorTracking(language, code);

  // Initialize user ID and Firebase data collection manager (only for logged-in users)
  useEffect(() => {
    const initializeUser = async () => {
      // Only initialize data collection for logged-in users
      if (!user) {
        console.log("Guest user - skipping data collection initialization");
        return;
      }

      try {
        console.log("Initializing user information for logged-in user...");

        // Try to get user info from API
        const userInfo = await getUserInfo();
        setUserId(userInfo.id);

        // Initialize Offline Data Collector with complete user info
        await offlineDataCollector.initialize(userInfo.id, userInfo.username);
      } catch (error) {
        console.error("Error initializing user:", error);
        // For logged-in users, still try to initialize with basic info
        if (user.id) {
          setUserId(user.id);
          await offlineDataCollector.initialize(
            user.id,
            user.username || "User"
          );
        }
      }
    };

    initializeUser();

    // Cleanup function
    return () => {
      if (user) {
        offlineDataCollector.cleanup();
      }
    };
  }, [user]); // Re-run when user changes

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        // Get problem with translation support
        const problemData = await getProblemById(id, currentLanguage);
        setProblem(problemData);

        if (problemData) {
          setLanguage(
            Object.keys(problemData.functionSignatures)[0] || "javascript"
          );
        }
        setLoading(false);
      } catch (error) {
        console.error("Error loading problem:", error);
        setError("Failed to load problem");
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, currentLanguage]); // Re-fetch when language changes

  // Separate effect for starting session when both problem and userId are available
  useEffect(() => {
    if (problem && userId && !sessionId) {
      startOfflineSession(problem);
    }
  }, [problem, userId, sessionId]);

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

  // Cleanup on unmount and page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessionId) {
        try {
          firebaseLogger.pageUnloadSave(sessionId);

          // Use sendBeacon for reliable data sending during page unload
          const endData = {
            sessionId: sessionId,
            userId: userId,
            endTime: new Date().toISOString(),
            status: "completed",
            trigger: "page_unload",
          };

          // Try to send data using sendBeacon (more reliable for page unload)
          if (navigator.sendBeacon) {
            const blob = new Blob([JSON.stringify(endData)], {
              type: "application/json",
            });
            navigator.sendBeacon("/api/firebase-sync", blob);
          }

          // Also try synchronous Firebase call (may not complete)
          offlineDataCollector.endSession();
        } catch (error) {
          firebaseLogger.error("sync", "Error during page unload sync", error, {
            sessionId,
          });
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && sessionId) {
        // Page is being hidden, save data
        firebaseLogger.visibilityChangeSave(sessionId);
        offlineDataCollector.uploadOfflineData();
      }
    };

    // Add event listeners for page unload
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Clear auto-save interval
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        setAutoSaveInterval(null);
      }

      if (sessionId) {
        offlineDataCollector.endSession();
      }
    };
  }, [sessionId]);

  /**
   * Start offline data collection session
   * Bắt đầu session thu thập dữ liệu offline
   */
  const startOfflineSession = async (problemData) => {
    try {
      const newSessionId =
        offlineDataCollector.startProblemSession(problemData);
      setSessionId(newSessionId);

      // Debug: Make debugger available in console
      if (typeof window !== "undefined") {
        window.debugFirebaseData = () =>
          firebaseDebugger.checkFirebaseData(userId);
        window.testFirebaseConnection = () =>
          firebaseDebugger.testFirebaseConnection();
        window.getFirebaseUploadStatus = () => firebaseLogger.getUploadStatus();
        window.getFirebaseLogs = (category, level, limit) =>
          firebaseLogger.getLogs(category, level, limit);
        window.testFirebaseWrite = async () => {
          try {
            console.log("Testing Firebase write...");
            const testData = {
              userId: userId,
              problemId: problem.id,
              testData: "Firebase connection test",
              timestamp: new Date().toISOString(),
            };
            await offlineDataCollector.testFirebaseConnection(testData);
            console.log("Firebase write test successful");
          } catch (error) {
            console.error("Firebase write test failed:", error);
          }
        };
        window.getSimplifiedEvents = () =>
          offlineDataCollector.getSimplifiedEvents();
        console.log(
          "Debug commands available: debugFirebaseData(), testFirebaseConnection(), getFirebaseUploadStatus(), getFirebaseLogs(), testFirebaseWrite(), getSimplifiedEvents()"
        );
      }
    } catch (error) {
      console.error("Error starting comprehensive Firebase session:", error);
    }
  };

  /**
   * Handle Monaco editor mount
   * Xử lý khi Monaco editor được mount
   */
  const handleEditorDidMount = (editor) => {
    // Initialize code tracking
    const cleanup = initializeTracking(editor);

    // Store cleanup function for later use
    if (cleanup) {
      // Could store this in a ref if needed for manual cleanup
    }
  };

  /**
   * Handle code change in editor
   * Xử lý thay đổi code trong editor
   */
  const handleCodeChange = (newCode) => {
    setCode(newCode);

    // Record code change using offline collector
    if (sessionId && newCode !== undefined) {
      offlineDataCollector.recordCodeChange(newCode, language);
    }
  };

  // Submit solution
  const handleSubmit = async () => {
    // Check if user is logged in
    if (!user) {
      setSubmitResults({
        status: "ERROR",
        error: "Vui lòng đăng nhập để nộp bài",
      });
      return;
    }

    setSubmitting(true);
    setSubmitResults(null);

    try {
      const payload = {
        problemId: problem.id,
        language,
        sourceCode: code,
      };

      const response = await submitCode(payload);
      setSubmissionId(response.id);

      // Poll for submission results
      const result = await pollSubmissionStatus(response.id);
      setSubmitResults(result);

      // Record submission attempt in enhanced service
      if (sessionId) {
        const submissionData = {
          language: language,
          wasSuccessful: result.status === "ACCEPTED",
          difficultyLevel: problem.difficulty,
          topics: problem.topics || [],
          dataTypes: extractDataTypesFromTestCases(problem.testCases || []),
          additionalMetadata: JSON.stringify({
            submissionId: response.id,
            runtimeMs: result.runtimeMs,
            memoryUsedKb: result.memoryUsedKb,
            passedTestCases: result.passedTestCases,
            totalTestCases: result.totalTestCases,
          }),
        };

        offlineDataCollector.recordSubmissionAttempt(submissionData);
      }

      // If solved, mark as solved
      if (result.status === "ACCEPTED") {
        try {
          await axios.post(
            `http://localhost:8080/api/submissions/${problem.id}/mark-solved`,
            {},
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
        } catch (e) {
          console.error("Error marking problem as solved:", e);
        }
      }
    } catch (error) {
      console.error("Submit error:", error);

      // Record failed submission attempt
      if (sessionId) {
        const failedSubmissionData = {
          language: language,
          wasSuccessful: false,
          difficultyLevel: problem.difficulty,
          topics: problem.topics || [],
          dataTypes: extractDataTypesFromTestCases(problem.testCases || []),
          additionalMetadata: JSON.stringify({
            error: error.message,
          }),
        };

        try {
          offlineDataCollector.recordSubmissionAttempt(failedSubmissionData);
        } catch (dataError) {
          console.warn("Failed to record failed submission:", dataError);
        }
      }

      setSubmitResults({
        status: "ERROR",
        error: error.message || "Failed to submit code",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Extract data types from test cases
   * Trích xuất kiểu dữ liệu từ test cases
   */
  const extractDataTypesFromTestCases = (testCases) => {
    const dataTypes = new Set();

    testCases.forEach((testCase) => {
      try {
        if (testCase.inputData) {
          const inputData = JSON.parse(testCase.inputData);
          if (Array.isArray(inputData)) {
            dataTypes.add("Array");
            inputData.forEach((item) => {
              if (item.dataType) {
                dataTypes.add(item.dataType);
              }
            });
          }
        }
      } catch (error) {
        // Ignore parsing errors
      }
    });

    return Array.from(dataTypes);
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error || !problem)
    return (
      <div className="text-center py-10 text-red-500">Problem not found</div>
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

  // Lấy các test case ví dụ
  const exampleTestCases = (problem.testCases || []).filter(
    (tc) => tc.isExample
  );

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Header />

      {/* Guest User Notice */}
      {!user && (
        <div className="bg-blue-900/30 border border-blue-700/50 mx-auto max-w-6xl w-full mt-4 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-blue-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-blue-200 text-sm">
              Bạn đang ở chế độ khách. Bạn có thể đọc bài toán và xem thảo luận,
              nhưng cần
              <a
                href="/login"
                className="text-blue-400 hover:text-blue-300 underline mx-1"
              >
                đăng nhập
              </a>
              để nộp bài và tham gia thảo luận.
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 container mx-auto px-4 py-4 sm:py-8 text-white max-w-7xl overflow-x-hidden">
        <div className="flex flex-col xl:flex-row gap-0 xl:gap-1 h-[calc(100vh-200px)] min-h-[600px]">
          {/* Problem Description */}
          <section
            className="bg-zinc-900 rounded-lg p-4 sm:p-6 overflow-y-auto mb-4 xl:mb-0 flex-shrink-0"
            style={{
              width: window.innerWidth >= 1280 ? `${leftWidth}%` : "100%",
              minHeight: window.innerWidth >= 1280 ? "100%" : "400px",
              maxHeight: window.innerWidth >= 1280 ? "100%" : "400px",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-xl xl:text-2xl font-bold break-words">
                  {problem.title}
                </h1>
                {getDifficultyBadge(problem.difficulty)}
              </div>
              {/* <ReportButton
              problemId={parseInt(id)}
              problemTitle={problem.title}
            /> */}
            </div>
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
                  }}
                >
                  {problem.description}
                </ReactMarkdown>
              </div>
            </div>

            {/* Input/Output Description */}
            <div className="mb-4">
              <h3 className="font-bold mb-2 text-sm xl:text-base">
                {currentLanguage === "vi" ? "Đầu vào" : "Input"}
              </h3>
              <p className="mb-3 xl:mb-4 text-gray-300 text-sm xl:text-base leading-relaxed break-words">
                {problem.inputDescription ||
                  (currentLanguage === "vi"
                    ? "Hai số nguyên a và b (-10^9 ≤ a, b ≤ 10^9)."
                    : "Two integers a and b (-10^9 ≤ a, b ≤ 10^9).")}
              </p>

              <h3 className="font-bold mb-2 text-sm xl:text-base">
                {currentLanguage === "vi" ? "Đầu ra" : "Output"}
              </h3>
              <p className="mb-3 xl:mb-4 text-gray-300 text-sm xl:text-base leading-relaxed break-words">
                {problem.outputDescription ||
                  (currentLanguage === "vi"
                    ? "Tổng của hai số a và b."
                    : "The sum of two numbers a and b.")}
              </p>
            </div>

            {exampleTestCases.length > 0 && (
              <div className="mb-4">
                <h2 className="font-bold mb-2 text-sm xl:text-base">
                  {currentLanguage === "vi" ? "Ví dụ" : "Example"}
                </h2>
                {exampleTestCases.map((tc) => {
                  // Parse input/output
                  let input = "";
                  let output = "";
                  try {
                    console.log(
                      "🔍 ProblemDetails - Parsing test case inputData:",
                      tc.inputData
                    );
                    const inputArr = JSON.parse(tc.inputData);
                    console.log(
                      "🔍 ProblemDetails - Parsed inputArr:",
                      inputArr
                    );
                    input = inputArr.map((i) => i.input).join(", ");
                    console.log(
                      "🔍 ProblemDetails - Final input display:",
                      input
                    );

                    const outputObj = JSON.parse(tc.expectedOutputData);
                    output = outputObj.expectedOutput;
                  } catch (error) {
                    console.error(
                      "❌ ProblemDetails - Error parsing test case data:",
                      error
                    );
                    console.error(
                      "❌ ProblemDetails - Raw inputData:",
                      tc.inputData
                    );
                    console.error(
                      "❌ ProblemDetails - Raw expectedOutputData:",
                      tc.expectedOutputData
                    );
                  }
                  return (
                    <div
                      key={tc.id}
                      className="mb-3 bg-zinc-800 p-2 xl:p-3 rounded border border-zinc-700"
                    >
                      <div className="mb-1">
                        <span className="font-bold text-blue-300 text-xs xl:text-sm">
                          {currentLanguage === "vi" ? "Đầu vào:" : "Input:"}
                        </span>{" "}
                        <span className="break-all text-xs xl:text-sm font-mono bg-zinc-900 px-1 py-0.5 rounded">
                          {input}
                        </span>
                      </div>
                      <div className="mb-1">
                        <span className="font-bold text-green-300 text-xs xl:text-sm">
                          {currentLanguage === "vi" ? "Đầu ra:" : "Output:"}
                        </span>{" "}
                        <span className="break-all text-xs xl:text-sm font-mono bg-zinc-900 px-1 py-0.5 rounded">
                          {output}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {problem.topics && problem.topics.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold mb-2 text-sm xl:text-base">
                  {currentLanguage === "vi" ? "Chủ đề:" : "Topics:"}
                </h3>
                <div className="flex flex-wrap gap-1 xl:gap-2">
                  {problem.topics.map((t, i) => (
                    <span
                      key={i}
                      className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs xl:text-sm break-words"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {problem.constraints && (
              <div className="mb-4">
                <h3 className="font-bold mb-2 text-sm xl:text-base">
                  {currentLanguage === "vi" ? "Ràng buộc:" : "Constraints:"}
                </h3>
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
                    }}
                  >
                    {problem.constraints}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </section>

          {/* Resizer Bar - Only show on desktop */}
          <div
            className="hidden xl:block w-1 bg-zinc-700 hover:bg-zinc-600 cursor-col-resize transition-colors"
            onMouseDown={handleMouseDown}
            title="Drag to resize"
          />

          {/* Code Editor and Results */}
          <section
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
                  {Object.keys(problem.functionSignatures || {}).map((lang) => (
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
                  language={languageMap[language]}
                  theme="vs-dark"
                  value={code}
                  onChange={handleCodeChange}
                  onMount={handleEditorDidMount}
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
                  disabled={submitting || !user}
                  className={`w-full px-3 xl:px-4 py-2 xl:py-3 rounded-lg font-medium transition-colors text-sm xl:text-base ${
                    submitting || !user
                      ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                  title={
                    !user
                      ? currentLanguage === "vi"
                        ? "Vui lòng đăng nhập để nộp bài"
                        : "Please login to submit"
                      : ""
                  }
                >
                  {submitting
                    ? currentLanguage === "vi"
                      ? "Đang nộp bài..."
                      : "Submitting..."
                    : !user
                    ? currentLanguage === "vi"
                      ? "Đăng nhập để nộp bài"
                      : "Login to Submit"
                    : currentLanguage === "vi"
                    ? "Nộp bài"
                    : "Submit"}
                </button>
              </div>

              {submitResults && (
                <div className="mt-3 xl:mt-4 p-3 xl:p-4 border border-zinc-700 rounded-lg">
                  <h3 className="text-base xl:text-lg font-semibold mb-2">
                    {currentLanguage === "vi"
                      ? "Kết quả nộp bài:"
                      : "Submission Results:"}
                  </h3>
                  <div
                    className={`p-3 xl:p-4 rounded ${
                      submitResults.status === "ACCEPTED"
                        ? "bg-green-900/30 border border-green-700"
                        : "bg-red-900/30 border border-red-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                      <div>
                        <span className="font-bold text-sm xl:text-base">
                          {currentLanguage === "vi" ? "Trạng thái:" : "Status:"}{" "}
                        </span>
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs xl:text-sm ${
                            submitResults.status === "ACCEPTED"
                              ? "bg-green-600"
                              : "bg-red-600"
                          }`}
                        >
                          {submitResults.status}
                        </span>
                      </div>
                      <div className="text-sm xl:text-base">
                        <span className="mr-3">
                          Runtime: {submitResults.runtimeMs}ms
                        </span>
                        <span>Memory: {submitResults.memoryUsedKb}KB</span>
                      </div>
                    </div>

                    {submitResults.status === "ACCEPTED" && (
                      <div className="mt-2 text-green-400 text-sm xl:text-base">
                        {currentLanguage === "vi"
                          ? "Chúc mừng! Tất cả test case đã pass."
                          : "Congratulations! All test cases passed."}
                      </div>
                    )}

                    {submitResults.status === "WRONG_ANSWER" && (
                      <div className="mt-2">
                        <p className="text-red-400 text-sm xl:text-base">
                          {currentLanguage === "vi"
                            ? `Giải pháp của bạn đã pass ${submitResults.passedTestCases}/${submitResults.totalTestCases} test cases.`
                            : `Your solution passed ${submitResults.passedTestCases}/${submitResults.totalTestCases} test cases.`}
                        </p>
                        <button
                          onClick={() =>
                            (window.location.href = `/submissions/${submissionId}`)
                          }
                          className="text-blue-400 underline mt-2 text-sm xl:text-base"
                        >
                          {currentLanguage === "vi"
                            ? "Xem chi tiết submission"
                            : "View submission details"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Comments Section */}
      <div className="container mx-auto px-4 pb-8 max-w-7xl">
        <CommentsSection problemId={parseInt(id)} user={user} />
      </div>

      <Footer />
    </div>
  );
};

export default ProblemDetails;
