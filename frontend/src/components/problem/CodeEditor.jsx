import React, { useState, useEffect } from "react";
import {
  Select,
  Button,
  Space,
  Card,
  Divider,
  message,
  Tooltip,
  Spin,
} from "antd";
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  SendOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Editor } from "@monaco-editor/react";
import { useAuth } from "../../contexts/AuthContext";
import { submitCode, pollSubmissionStatus } from "../../api/submissionApi";

const { Option } = Select;

const defaultCode = {
  java: `class Solution {
    // Write your solution here
}`,
  python: `class Solution:
    # Write your solution here
    pass`,
  cpp: `class Solution {
public:
    // Write your solution here
};`,
  javascript: `/**
 * @return {void}
 */
var solution = function() {
    // Write your solution here
};`,
};

const CodeEditor = ({
  problem,
  contestId = null,
  onSubmissionComplete = null,
  language,
  value,
  onChange,
  height = "500px",
  options = {},
  hideLanguageSelector = false,
}) => {
  const [editorLanguage, setEditorLanguage] = useState(language || "java");
  const [code, setCode] = useState(value || defaultCode[language || "java"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState(null);
  const { token } = useAuth();
  const editorHeight = height;

  useEffect(() => {
    // Nếu có value được truyền vào từ prop, sử dụng nó
    if (value !== undefined) {
      setCode(value);
    }
    // Nếu có language được truyền vào từ prop, sử dụng nó
    if (language) {
      setEditorLanguage(language);
    }
  }, [value, language]);

  useEffect(() => {
    // Chỉ áp dụng logic cũ khi đang sử dụng trong context của problem
    if (problem) {
      // Cung cấp mã mẫu từ problem hoặc sử dụng mã mặc định
      if (problem?.solutionTemplate) {
        setCode(problem.solutionTemplate);
      } else {
        setCode(defaultCode[editorLanguage]);
      }
    }
  }, [editorLanguage, problem]);

  const handleLanguageChange = (value) => {
    setEditorLanguage(value);
    // Nếu có hàm onChange được truyền vào, gọi nó với editorLanguage mới
    if (onChange && value !== code) {
      setCode(defaultCode[value]);
      onChange(defaultCode[value]);
    }
  };

  const handleCodeChange = (value) => {
    setCode(value);
    // Nếu có hàm onChange được truyền vào, gọi nó với code mới
    if (onChange && value !== undefined) {
      onChange(value);
    }
  };

  const handleRun = async () => {
    try {
      setIsRunning(true);
      setResult(null);

      // Tạo submission object với cờ đánh dấu chỉ là test run, không tính điểm
      const submissionData = {
        problemId: problem.id,
        language: editorLanguage,
        sourceCode: code,
        isTest: true,
        contestId: contestId,
      };

      const submission = await submitCode(submissionData);
      const submissionId = submission.id;

      // Poll for results
      const result = await pollSubmissionStatus(submissionId);

      if (
        result.status === "PENDING" ||
        result.status === "TIME_LIMIT_EXCEEDED"
      ) {
        message.error("Test run timed out. Please try again later.");
      } else {
        setResult({
          id: result.id,
          status: result.status,
          runtime: `${result.runtimeMs} ms`,
          memory: `${(result.memoryUsedKb / 1024).toFixed(2)} MB`,
          testCases: result.testCases || [],
          passedTestCases: result.passedTestCases,
          totalTestCases: result.totalTestCases,
        });
      }

      setIsRunning(false);
    } catch (error) {
      console.error("Error running code:", error);
      message.error("Failed to run code");
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setResult(null);

      // Tạo submission object
      const submissionData = {
        problemId: problem.id,
        language: editorLanguage,
        sourceCode: code,
        isTest: false,
        contestId: contestId,
      };

      const submission = await submitCode(submissionData);
      const submissionId = submission.id;

      // Poll for results
      const result = await pollSubmissionStatus(submissionId);

      if (
        result.status === "PENDING" ||
        result.status === "TIME_LIMIT_EXCEEDED"
      ) {
        message.error(
          "Submission timed out. It will continue processing in the background."
        );
      } else {
        setResult({
          id: result.id,
          status: result.status,
          runtime: `${result.runtimeMs} ms`,
          memory: `${(result.memoryUsedKb / 1024).toFixed(2)} MB`,
          testCases: result.testCases || [],
          passedTestCases: result.passedTestCases,
          totalTestCases: result.totalTestCases,
          compileError: result.compileError,
          score: result.score,
        });

        // Call the callback if provided (e.g., to refresh submission history)
        if (onSubmissionComplete) {
          onSubmissionComplete(result);
        }

        // Show success message only if accepted
        if (result.status === "ACCEPTED") {
          message.success("Submission successful!");
        } else if (result.status === "COMPILE_ERROR") {
          message.error("Compilation error!");
        } else {
          message.warning(`Submission result: ${result.status}`);
        }
      }

      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting code:", error);
      message.error("Failed to submit code");
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "ACCEPTED") return "green";
    if (status === "WRONG_ANSWER") return "red";
    if (status === "TIME_LIMIT_EXCEEDED") return "orange";
    if (status === "RUNTIME_ERROR") return "orange";
    if (status === "COMPILE_ERROR") return "red";
    return "gray";
  };

  const getStatusIcon = (status) => {
    if (status === "ACCEPTED") return <CheckCircleOutlined />;
    if (status === "WRONG_ANSWER") return <CloseCircleOutlined />;
    if (status === "TIME_LIMIT_EXCEEDED") return <ClockCircleOutlined />;
    if (status === "RUNTIME_ERROR") return <CloseCircleOutlined />;
    if (status === "COMPILE_ERROR") return <CloseCircleOutlined />;
    return null;
  };

  return (
    <div className="code-editor-container">
      {!hideLanguageSelector && problem && (
        <Card className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <Select
              value={editorLanguage}
              onChange={handleLanguageChange}
              style={{ width: 150 }}
              disabled={isSubmitting || isRunning}
            >
              {problem?.allowedLanguages?.map((lang) => (
                <Option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </Option>
              ))}
            </Select>
            <Space>
              <Tooltip title="Chạy thử với ví dụ">
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={handleRun}
                  loading={isRunning}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Chạy thử
                </Button>
              </Tooltip>
              <Tooltip title="Nộp bài để chấm điểm">
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSubmit}
                  loading={isSubmitting}
                  className="bg-green-500 hover:bg-green-600"
                >
                  Nộp bài
                </Button>
              </Tooltip>
            </Space>
          </div>
        </Card>
      )}

      <div className="border rounded-md overflow-hidden">
        <Editor
          height={editorHeight}
          language={editorLanguage}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            formatOnPaste: true,
            formatOnType: true,
            autoClosingBrackets: "always",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            ...options,
          }}
        />
      </div>

      {isSubmitting && !result && (
        <Card className="mb-4">
          <div className="flex items-center justify-center p-4">
            <Spin size="large" />
            <span className="ml-3">Đang xử lý bài nộp của bạn...</span>
          </div>
        </Card>
      )}

      {isRunning && !result && (
        <Card className="mb-4">
          <div className="flex items-center justify-center p-4">
            <Spin size="large" />
            <span className="ml-3">Đang chạy thử nghiệm...</span>
          </div>
        </Card>
      )}

      {result && (
        <Card
          title={
            <div className="flex items-center">
              <span
                className={`text-${getStatusColor(
                  result.status
                )} font-bold mr-2`}
              >
                {getStatusIcon(result.status)} {result.status}
              </span>
              {result.status !== "COMPILE_ERROR" && (
                <span className="text-gray-500 text-sm ml-4">
                  Runtime: {result.runtime}, Memory: {result.memory}
                </span>
              )}
              {result.score !== null && result.score !== undefined && (
                <span className="text-gray-500 text-sm ml-4">
                  Score: {result.score}
                </span>
              )}
              <span className="text-gray-500 text-sm ml-4">
                {result.passedTestCases}/{result.totalTestCases} testcases
              </span>
            </div>
          }
          className="mb-4"
        >
          {result.compileError && (
            <div className="mb-4">
              <Divider>Compile Error</Divider>
              <pre className="bg-red-100 text-red-800 p-3 rounded overflow-auto">
                {result.compileError}
              </pre>
            </div>
          )}

          {result.testCases && result.testCases.length > 0 && (
            <>
              <Divider>Kết quả test</Divider>
              <div className="space-y-4">
                {result.testCases.map((testCase, index) => (
                  <Card
                    key={index}
                    size="small"
                    title={`Test case ${index + 1}: ${
                      testCase.passed ? "Passed" : "Failed"
                    }`}
                    className={`${
                      testCase.passed ? "border-green-500" : "border-red-500"
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium mb-1">Input:</p>
                        <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                          {testCase.input}
                        </pre>
                      </div>
                      <div>
                        <div className="mb-2">
                          <p className="font-medium mb-1">Expected Output:</p>
                          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Your Output:</p>
                          <pre
                            className={`p-2 rounded text-sm overflow-auto ${
                              testCase.passed ? "bg-green-100" : "bg-red-100"
                            }`}
                          >
                            {testCase.actualOutput}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default CodeEditor;
