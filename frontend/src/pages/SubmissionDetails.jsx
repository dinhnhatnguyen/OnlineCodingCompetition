import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSubmissionById } from "../api/submissionApi";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import MonacoEditor from "@monaco-editor/react";
import axios from "axios";

const languageMap = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp",
};

const SubmissionDetails = () => {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy thông tin submission
        const submissionData = await getSubmissionById(id);
        setSubmission(submissionData);

        // Lấy thông tin chi tiết các test case
        const testCaseData = await axios.get(
          `http://localhost:8080/api/submissions/${id}/test-cases`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setTestCases(testCaseData.data);
      } catch (error) {
        console.error("Error fetching submission:", error);
        setError(error.message || "Failed to load submission details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePrevTest = () => {
    setCurrentTestIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextTest = () => {
    setCurrentTestIndex((prev) => Math.min(testCases.length - 1, prev + 1));
  };

  if (loading)
    return (
      <div className="bg-black text-white min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-10">Loading...</div>
        </div>
        <Footer />
      </div>
    );

  if (error || !submission)
    return (
      <div className="bg-black text-white min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-10 text-red-500">
            {error || "Submission not found"}
          </div>
        </div>
        <Footer />
      </div>
    );

  // Calculate number of passed test cases
  const passedTestCases = testCases.filter(
    (tc) => tc.status === "PASSED"
  ).length;

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full py-8 px-2 md:px-0">
        <h1 className="text-2xl font-bold mb-4">Submission Details</h1>

        <div className="bg-zinc-900 p-6 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h2 className="text-xl">
                {submission.problem?.title || "Unknown Problem"}
              </h2>
              <div className="text-sm text-gray-400">
                Submitted: {new Date(submission.submittedAt).toLocaleString()}
                {submission.completedAt &&
                  ` • Completed: ${new Date(
                    submission.completedAt
                  ).toLocaleString()}`}
              </div>
            </div>
            <div className="mt-2 md:mt-0">
              <span
                className={`px-3 py-1 rounded ${
                  submission.status === "ACCEPTED"
                    ? "bg-green-600"
                    : submission.status === "PENDING" ||
                      submission.status === "PROCESSING"
                    ? "bg-yellow-600"
                    : "bg-red-600"
                }`}
              >
                {submission.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-gray-400">Language:</span>{" "}
              {submission.language}
            </div>
            <div>
              <span className="text-gray-400">Score:</span>{" "}
              {submission.score || "N/A"}
            </div>
            <div>
              <span className="text-gray-400">Runtime:</span>{" "}
              {submission.runtimeMs}ms
            </div>
            <div>
              <span className="text-gray-400">Memory:</span>{" "}
              {submission.memoryUsedKb}KB
            </div>
            <div className="col-span-2">
              <span className="text-gray-400">Test Cases:</span>{" "}
              <span
                className={
                  passedTestCases === testCases.length
                    ? "text-green-400"
                    : "text-yellow-400"
                }
              >
                {passedTestCases}/{testCases.length}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Your Code</h3>
            <div className="bg-black rounded overflow-hidden border border-zinc-800">
              <MonacoEditor
                height="400px"
                language={languageMap[submission.language] || "javascript"}
                value={submission.sourceCode}
                theme="vs-dark"
                options={{ readOnly: true, minimap: { enabled: false } }}
              />
            </div>
          </div>

          {submission.compileError && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-red-400">
                Compile Error
              </h3>
              <pre className="bg-red-900/30 p-4 rounded overflow-x-auto text-sm border border-red-800">
                {submission.compileError}
              </pre>
            </div>
          )}
        </div>

        {testCases.length > 0 && (
          <div className="bg-zinc-900 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Test Results</h3>
              <div className="text-sm">
                <span
                  className={
                    passedTestCases === testCases.length
                      ? "text-green-400"
                      : "text-yellow-400"
                  }
                >
                  {passedTestCases}/{testCases.length} tests passed
                </span>
              </div>
            </div>

            {/* Navigation controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">
                Test Case {currentTestIndex + 1} of {testCases.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevTest}
                  disabled={currentTestIndex === 0}
                  className={`px-3 py-1 rounded ${
                    currentTestIndex === 0
                      ? "bg-zinc-700 text-zinc-500"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  Prev
                </button>
                <button
                  onClick={handleNextTest}
                  disabled={currentTestIndex === testCases.length - 1}
                  className={`px-3 py-1 rounded ${
                    currentTestIndex === testCases.length - 1
                      ? "bg-zinc-700 text-zinc-500"
                      : "bg-zinc-700 hover:bg-zinc-600"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-zinc-800 h-1.5 mb-4 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300 ease-in-out"
                style={{
                  width: `${
                    ((currentTestIndex + 1) / testCases.length) * 100
                  }%`,
                  backgroundColor:
                    testCases[currentTestIndex].status === "PASSED"
                      ? "#34D399"
                      : "#F87171",
                }}
              />
            </div>

            {/* Current test case */}
            <div
              className={`p-4 rounded ${
                testCases[currentTestIndex].status === "PASSED"
                  ? "bg-green-900/30 border border-green-700"
                  : testCases[currentTestIndex].status === "TIME_LIMIT_EXCEEDED"
                  ? "bg-yellow-900/30 border border-yellow-700"
                  : "bg-red-900/30 border border-red-700"
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      testCases[currentTestIndex].status === "PASSED"
                        ? "bg-green-700"
                        : testCases[currentTestIndex].status ===
                          "TIME_LIMIT_EXCEEDED"
                        ? "bg-yellow-700"
                        : "bg-red-700"
                    }`}
                  >
                    {testCases[currentTestIndex].status ===
                    "TIME_LIMIT_EXCEEDED"
                      ? "THỜI GIAN VƯỢT QUÁ"
                      : testCases[currentTestIndex].status}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="mr-3">
                    Runtime: {testCases[currentTestIndex].runtimeMs}ms
                  </span>
                  <span>
                    Memory: {testCases[currentTestIndex].memoryUsedKb}KB
                  </span>
                </div>
              </div>

              {!testCases[currentTestIndex].isHidden && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="break-all">
                    <div className="font-semibold mb-1">Input:</div>
                    <pre className="bg-black/40 p-2 rounded overflow-auto max-h-60">
                      {testCases[currentTestIndex].input}
                    </pre>
                  </div>

                  <div className="break-all">
                    <div className="font-semibold mb-1">Expected:</div>
                    <pre className="bg-black/40 p-2 rounded overflow-auto max-h-60">
                      {testCases[currentTestIndex].expectedOutput}
                    </pre>
                  </div>

                  <div className="break-all">
                    <div className="font-semibold mb-1">Your Output:</div>
                    <pre
                      className={`p-2 rounded overflow-auto max-h-60 ${
                        testCases[currentTestIndex].status === "PASSED"
                          ? "bg-black/40"
                          : "bg-red-800/40"
                      }`}
                    >
                      {testCases[currentTestIndex].userOutput || ""}
                    </pre>
                  </div>
                </div>
              )}

              {testCases[currentTestIndex].isHidden && (
                <div className="text-yellow-400 text-sm">
                  This is a hidden test case. Details cannot be shown.
                </div>
              )}

              {testCases[currentTestIndex].errorMessage && (
                <div className="mt-2">
                  <div className="font-semibold">Error:</div>
                  <pre className="bg-red-900/50 p-2 rounded text-sm overflow-auto max-h-40">
                    {testCases[currentTestIndex].errorMessage}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default SubmissionDetails;
