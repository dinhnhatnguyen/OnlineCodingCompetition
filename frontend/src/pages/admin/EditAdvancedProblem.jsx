import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Skeleton, Alert, Card, Result, Space, Button } from "antd";
import AdvancedProblemForm from "../../components/admin/AdvancedProblemForm";
import {
  getProblemById,
  updateProblemWithTestCases,
} from "../../api/problemApi";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const { Title, Text } = Typography;

const EditAdvancedProblem = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);
        const problemData = await getProblemById(id);
        console.log("Raw problem data:", problemData);

        // Format the data for the form
        const formattedProblem = {
          ...problemData,
          // Ensure difficulty is set
          difficulty: problemData.difficulty || "MEDIUM",
          // Set initial values for each language's function signature fields
          ...Object.entries(problemData.functionSignatures || {}).reduce(
            (acc, [language, signature]) => {
              acc[`${language}FunctionName`] = signature.functionName;
              acc[`${language}ReturnType`] = signature.returnType;

              // Set parameter types
              signature.parameterTypes.forEach((type, index) => {
                acc[`${language}ParameterTypes${index}`] = type;
              });
              acc[`${language}ParameterCount`] =
                signature.parameterTypes.length;

              // Also keep the full signature as JSON string
              acc[`${language}Signature`] = JSON.stringify(signature, null, 2);
              return acc;
            },
            {}
          ),
          // Set supported languages
          supportedLanguages: Object.keys(
            problemData.functionSignatures || {}
          ).reduce(
            (acc, lang) => {
              acc[lang] = true;
              return acc;
            },
            {
              java: false,
              python: false,
              javascript: false,
              cpp: false,
            }
          ),
          // Ensure other required fields have default values
          defaultTimeLimit: problemData.defaultTimeLimit || 1000,
          defaultMemoryLimit: problemData.defaultMemoryLimit || 262144,
          topics: problemData.topics || [],
          constraints: problemData.constraints || "",
        };

        console.log("Formatted problem data for form:", formattedProblem);
        setProblem(formattedProblem);
        setError(null);
      } catch (err) {
        console.error("Error fetching problem:", err);
        setError(`Không thể tải thông tin bài toán: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      console.log("Form values:", values);

      // Get the actual form values from the nested structure
      const formValues = values.createProblem || values;

      // Validate required fields
      if (!formValues.title?.trim()) {
        throw new Error("Tiêu đề không được để trống");
      }
      if (!formValues.description?.trim()) {
        throw new Error("Mô tả không được để trống");
      }

      // Parse function signatures back to objects
      const parsedFunctionSignatures = Object.entries(
        formValues.functionSignatures || {}
      ).reduce((acc, [language, signatureStr]) => {
        try {
          // If signatureStr is already an object, use it directly
          if (typeof signatureStr === "object") {
            acc[language] = JSON.stringify(signatureStr);
          } else {
            // Verify it's valid JSON
            JSON.parse(signatureStr);
            acc[language] = signatureStr;
          }
        } catch (err) {
          console.error(
            `Error parsing function signature for ${language}:`,
            err
          );
          throw new Error(
            `Function signature không hợp lệ cho ngôn ngữ ${language}`
          );
        }
        return acc;
      }, {});

      // Format the request data
      const updateData = {
        createProblem: {
          title: formValues.title.trim(),
          description: formValues.description.trim(),
          difficulty: (formValues.difficulty || "MEDIUM").toUpperCase(),
          topics: formValues.topics || [],
          constraints: formValues.constraints?.trim() || "",
          supportedLanguages: formValues.supportedLanguages || {
            java: false,
            python: false,
            javascript: false,
            cpp: false,
          },
          functionSignatures: parsedFunctionSignatures,
        },
      };

      // If editing, add the id
      if (problem?.id) {
        updateData.createProblem.id = problem.id;
      }

      // Add test cases if they exist
      if (problem?.testCases?.length > 0) {
        updateData.createTestCases = problem.testCases.map(
          (testCase, index) => ({
            inputData: testCase.inputData,
            inputType: testCase.inputType || "array",
            outputType: testCase.outputType || "integer",
            expectedOutputData: testCase.expectedOutputData,
            description: testCase.description || `Test case ${index + 1}`,
            isExample: testCase.isExample || false,
            isHidden: testCase.isHidden || false,
            timeLimit: testCase.timeLimit || 1000,
            memoryLimit: testCase.memoryLimit || 262144,
            weight: testCase.weight || 1.0,
            testOrder: testCase.testOrder || index + 1,
            comparisonMode: testCase.comparisonMode || "EXACT",
            epsilon: testCase.epsilon || null,
          })
        );
      }

      console.log("Sending update data:", updateData);

      await updateProblemWithTestCases(id, updateData, token);
      showSuccess("Bài toán đã được cập nhật thành công!");
      navigate("/admin/problems");
    } catch (error) {
      console.error("Error updating problem:", error);
      let errorMessage = "Không thể cập nhật bài toán";

      if (error.message.includes("Function signature")) {
        errorMessage = error.message;
      } else if (error.message.includes("không được để trống")) {
        errorMessage = error.message;
      } else if (error.response?.status === 403) {
        errorMessage = "Bạn không có quyền cập nhật bài toán này";
      } else if (error.response?.status === 404) {
        errorMessage = "Không tìm thấy bài toán để cập nhật";
      } else if (error.response?.status === 400) {
        errorMessage = "Dữ liệu không hợp lệ, vui lòng kiểm tra lại";
        console.error("Invalid data:", error.response?.data);
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      showError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // const handleTestCaseChange = (testCases) => {
  //   setTestCases(testCases);
  //   showInfo(`Đã cập nhật ${testCases.length} test case`);
  // };

  if (loading) {
    return (
      <Card className="my-6">
        <Skeleton active paragraph={{ rows: 10 }} />
      </Card>
    );
  }

  if (error) {
    return (
      <Result
        status="error"
        title="Lỗi tải dữ liệu"
        subTitle={error}
        extra={
          <Button type="primary" onClick={() => navigate("/admin/problems")}>
            Quay lại danh sách bài tập
          </Button>
        }
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Title level={2}>Chỉnh sửa thông tin bài toán nâng cao</Title>
        <Text type="secondary">
          Chỉnh sửa thông tin cơ bản và function signatures của bài toán. Test
          cases sẽ được giữ nguyên.
        </Text>
      </div>

      <Alert
        message="Lưu ý"
        description="Chức năng chỉnh sửa nâng cao hiện chỉ cho phép chỉnh sửa thông tin cơ bản và function signatures. Test cases sẽ không bị thay đổi."
        type="info"
        showIcon
        className="mb-6"
      />

      {problem ? (
        <AdvancedProblemForm
          onSubmit={handleSubmit}
          loading={submitting}
          initialValues={problem}
        />
      ) : (
        <Alert
          message="Không tìm thấy bài toán"
          description="Không thể tải thông tin bài toán. Vui lòng thử lại hoặc kiểm tra ID bài toán."
          type="error"
          showIcon
        />
      )}
    </div>
  );
};

export default EditAdvancedProblem;
