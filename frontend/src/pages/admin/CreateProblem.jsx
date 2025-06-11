import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "antd";
import ProblemForm from "../../components/admin/ProblemForm";
import { createProblemWithTestCases } from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";

const CreateProblem = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Xử lý và format dữ liệu test cases
      const formattedTestCases = (values.testCases || []).map(
        (testCase, index) => {
          // Đảm bảo input và output data được format đúng cấu trúc
          let inputData = testCase.input;
          let expectedOutputData = testCase.expectedOutput;

          // Kiểm tra và format input data nếu cần
          try {
            if (
              typeof testCase.input === "string" &&
              !testCase.input.startsWith("[{")
            ) {
              inputData = JSON.stringify([
                {
                  input: testCase.input,
                  dataType: testCase.inputType || "array",
                },
              ]);
            }
          } catch (e) {
            console.warn("Error formatting input data:", e);
          }

          // Kiểm tra và format output data nếu cần
          try {
            if (
              typeof testCase.expectedOutput === "string" &&
              !testCase.expectedOutput.startsWith("{")
            ) {
              expectedOutputData = JSON.stringify({
                expectedOutput: testCase.expectedOutput,
                dataType: testCase.outputType || "integer",
              });
            }
          } catch (e) {
            console.warn("Error formatting output data:", e);
          }

          return {
            inputData,
            expectedOutputData,
            inputType: testCase.inputType || "array",
            outputType: testCase.outputType || "integer",
            description: testCase.description || `Test case ${index + 1}`,
            isExample: testCase.isExample || false,
            isHidden: testCase.isHidden || false,
            timeLimit: testCase.timeLimit || 1000,
            memoryLimit: testCase.memoryLimit || 262144,
            weight: testCase.weight || 1.0,
            testOrder: index + 1,
            comparisonMode: testCase.comparisonMode || "EXACT",
            epsilon: testCase.epsilon || null,
          };
        }
      );

      const formattedData = {
        createProblem: {
          title: values.title?.trim(),
          description: values.description?.trim(),
          difficulty: (values.difficulty || "MEDIUM").toUpperCase(),
          topics: values.topics || [],
          constraints: values.constraints?.trim() || "",
          supportedLanguages: values.supportedLanguages || {
            java: false,
            python: false,
            javascript: false,
            cpp: false,
          },
          functionSignatures: values.functionSignatures || {},
        },
        createTestCases: formattedTestCases,
      };

      // Log để debug
      console.log("Formatted data being sent:", formattedData);

      await createProblemWithTestCases(formattedData, token);
      Modal.success({
        title: "Thành công",
        content: "Bài toán đã được tạo thành công!",
        onOk: () => navigate("/admin/problems"),
      });
    } catch (err) {
      console.error("Error creating problem:", err);
      Modal.error({
        title: "Lỗi",
        content: err.response?.data?.message || "Không thể tạo bài toán mới",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Problem</h1>
      <ProblemForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default CreateProblem;
