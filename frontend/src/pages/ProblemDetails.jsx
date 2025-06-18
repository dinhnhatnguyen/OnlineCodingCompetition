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
  const [problem, setProblem] = useState(null);
  const [allProblems, setAllProblems] = useState([]);
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

  // Code editor tracking hook
  const { initializeTracking } = useCodeEditorTracking(language, code);

  // Initialize user ID and Firebase data collection manager
  useEffect(() => {
    const initializeUser = async () => {
      try {
        console.log("Initializing user information...");

        // Try to get user info from API with fallback to token
        const userInfo = await getUserInfo();
        setUserId(userInfo.id);

        // Initialize Offline Data Collector with complete user info
        await offlineDataCollector.initialize(userInfo.id, userInfo.username);
      } catch (error) {
        console.error("Error initializing user:", error);

        // Demo mode fallback
        const demoUserId = 999;
        setUserId(demoUserId);
        await offlineDataCollector.initialize(demoUserId, "Demo User");
      }
    };

    initializeUser();

    // Cleanup function
    return () => {
      offlineDataCollector.cleanup();
    };
  }, []);

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
      <main className="flex-1 flex flex-col md:flex-row gap-6 max-w-6xl mx-auto w-full py-8 px-2 md:px-0">
        {/* Left: Problem Description */}
        <section className="bg-zinc-900 rounded-lg p-6 flex-1 min-w-[340px] max-w-xl">
          <div className="flex items-center mb-2">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            {getDifficultyBadge(problem.difficulty)}
          </div>
          <div className="mb-4">
            <div className="prose prose-invert text-white">
              <ReactMarkdown
                components={{
                  p: (props) => <p className="text-white" {...props} />,
                }}
              >
                {problem.description}
              </ReactMarkdown>
            </div>
          </div>
          {exampleTestCases.length > 0 && (
            <div className="mb-4">
              <h2 className="font-bold mb-1">Example</h2>
              {exampleTestCases.map((tc) => {
                // Parse input/output
                let input = "";
                let output = "";
                try {
                  const inputArr = JSON.parse(tc.inputData);
                  input = inputArr.map((i) => i.input).join(", ");
                  const outputObj = JSON.parse(tc.expectedOutputData);
                  output = outputObj.expectedOutput;
                } catch {
                  // ignore
                }
                return (
                  <div key={tc.id} className="mb-2">
                    <div className="text-sm">
                      <span className="font-semibold">Input:</span> {input}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">Output:</span> {output}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {problem.topics && problem.topics.length > 0 && (
            <div className="mb-2">
              <span className="font-semibold">Topics:</span>
              {problem.topics.map((t, i) => (
                <span
                  key={i}
                  className="ml-2 px-2 py-1 bg-zinc-800 text-gray-300 text-xs rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {problem.constraints && (
            <div className="mt-2">
              <h3 className="font-bold mb-1">Constraints:</h3>
              <div className="prose prose-invert text-sm text-gray-300">
                <ReactMarkdown
                  components={{
                    p: (props) => (
                      <p className="text-sm text-gray-300" {...props} />
                    ),
                  }}
                >
                  {problem.constraints}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </section>

        {/* Right: Code Editor + Results */}
        <section className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="bg-zinc-900 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <label htmlFor="language" className="mr-2">
                  Ngôn ngữ:
                </label>
                <select
                  id="language"
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {Object.keys(problem.functionSignatures || {}).map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="w-full h-96 border border-zinc-700 rounded overflow-hidden">
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
                  fontSize: 14,
                }}
              />
            </div>
            <div className="mt-4 flex gap-3">
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
          </div>

          {/* Display Submit Results */}
          {submitResults && (
            <div className="bg-zinc-900 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2">Submission Results</h3>
              <div
                className={`p-4 rounded ${
                  submitResults.status === "ACCEPTED"
                    ? "bg-green-900/30 border border-green-700"
                    : "bg-red-900/30 border border-red-700"
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <span className="font-bold">Status: </span>
                    <span
                      className={`inline-block px-2 py-1 rounded text-sm ${
                        submitResults.status === "ACCEPTED"
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      {submitResults.status}
                    </span>
                  </div>
                  <div>
                    <span className="mr-3">
                      Runtime: {submitResults.runtimeMs}ms
                    </span>
                    <span>Memory: {submitResults.memoryUsedKb}KB</span>
                  </div>
                </div>

                {submitResults.status === "ACCEPTED" && (
                  <div className="mt-2 text-green-400">
                    Congratulations! All test cases passed.
                  </div>
                )}

                {submitResults.status === "WRONG_ANSWER" && (
                  <div className="mt-2">
                    <p className="text-red-400">
                      Your solution passed {submitResults.passedTestCases}/
                      {submitResults.totalTestCases} test cases.
                    </p>
                    <button
                      onClick={() =>
                        (window.location.href = `/submissions/${submissionId}`)
                      }
                      className="text-blue-400 underline mt-2"
                    >
                      View submission details
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProblemDetails;
