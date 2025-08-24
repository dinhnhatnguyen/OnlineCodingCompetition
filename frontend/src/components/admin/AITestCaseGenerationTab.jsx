import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Button,
  Alert,
  Spin,
  Progress,
  Table,
  Space,
  Modal,
  message,
  Tooltip,
  Tag,
  Row,
  Col,
  Divider,
  Checkbox,
} from "antd";
import {
  ThunderboltOutlined,
  RobotOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { aiTestCaseApi } from "../../api/aiTestCaseApi";

const { TextArea } = Input;

const AITestCaseGenerationTab = ({
  problemTitle,
  problemDescription,
  constraints,
  onTestCasesGenerated,
  disabled = false,
  functionSignatures = {},
}) => {
  // Debug props on component mount
  console.log("🔥 AITestCaseGenerationTab - Component mounted with props:");
  console.log("🔥 problemTitle:", problemTitle);
  console.log("🔥 problemDescription:", problemDescription);
  console.log("🔥 constraints:", constraints);
  console.log("🔥 onTestCasesGenerated:", onTestCasesGenerated);
  console.log("🔥 disabled:", disabled);
  console.log("🔥 functionSignatures:", functionSignatures);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedTestCases, setGeneratedTestCases] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm] = Form.useForm();
  const [aiServiceStatus, setAiServiceStatus] = useState("unknown");
  const [progress, setProgress] = useState(0);
  const [validationStatus, setValidationStatus] = useState(null);

  // Check AI service health on component mount
  useEffect(() => {
    checkAIServiceHealth();
  }, []);

  // Debug props changes
  useEffect(() => {
    console.log("🔥 AITestCaseGenerationTab - Props changed:");
    console.log("🔥 onTestCasesGenerated:", onTestCasesGenerated);
    console.log("🔥 onTestCasesGenerated type:", typeof onTestCasesGenerated);
  }, [onTestCasesGenerated]);

  // Extract function signature info for AI
  const extractFunctionSignatureInfo = useCallback(() => {
    // Try to get the first available function signature (prefer Java, then Python, etc.)
    const languages = ["java", "python", "cpp", "javascript"];

    for (const lang of languages) {
      const signature = functionSignatures[lang];
      if (signature && signature.functionName) {
        try {
          const parsed =
            typeof signature === "string" ? JSON.parse(signature) : signature;
          return {
            functionName: parsed.functionName,
            returnType: parsed.returnType,
            parameterTypes: parsed.parameterTypes || [],
            parameterNames: parsed.parameterNames || [],
            language: lang,
          };
        } catch (error) {
          console.warn(`Failed to parse ${lang} function signature:`, error);
          continue;
        }
      }
    }

    return null;
  }, [functionSignatures]);

  // Validation function để kiểm tra thông tin cơ bản
  const validateBasicInformation = useCallback(
    (values) => {
      const errors = [];

      // Lấy thông tin từ form chính hoặc custom input
      const title = problemTitle || values.customTitle;
      const description = problemDescription || values.customDescription;
      const constraintsInfo = constraints || values.customConstraints;

      // Validate title
      if (!title || title.trim().length === 0) {
        errors.push("Tiêu đề bài toán không được để trống");
      } else if (title.trim().length < 5) {
        errors.push("Tiêu đề bài toán phải có ít nhất 5 ký tự");
      }

      // Validate description
      if (!description || description.trim().length === 0) {
        errors.push("Mô tả bài toán không được để trống");
      } else if (description.trim().length < 20) {
        errors.push(
          "Mô tả bài toán phải có ít nhất 20 ký tự để AI có thể hiểu rõ bài toán"
        );
      }

      // Validate constraints (optional but recommended)
      // Chuyển constraints thành warning thay vì error để không block AI generation
      // if (!constraintsInfo || constraintsInfo.trim().length === 0) {
      //   errors.push(
      //     "Ràng buộc và giới hạn không được để trống (ví dụ: giới hạn input, output)"
      //   );
      // }

      // Validate number of test cases
      if (
        !values.numberOfTestCases ||
        values.numberOfTestCases < 1 ||
        values.numberOfTestCases > 20
      ) {
        errors.push("Số lượng test cases phải từ 1 đến 20");
      }

      return {
        isValid: errors.length === 0,
        errors,
        data: {
          title: title?.trim(),
          description: description?.trim(),
          constraints:
            constraintsInfo?.trim() ||
            "Không có ràng buộc cụ thể được chỉ định",
          numberOfTestCases: values.numberOfTestCases,
        },
      };
    },
    [problemTitle, problemDescription, constraints]
  );

  // Check validation status when props change
  useEffect(() => {
    const checkValidation = () => {
      const validation = validateBasicInformation({
        customTitle: form.getFieldValue("customTitle") || "",
        customDescription: form.getFieldValue("customDescription") || "",
        customConstraints: form.getFieldValue("customConstraints") || "",
        numberOfTestCases: form.getFieldValue("numberOfTestCases") || 5,
      });
      setValidationStatus(validation);
    };

    checkValidation();
  }, [
    problemTitle,
    problemDescription,
    constraints,
    form,
    validateBasicInformation,
  ]);

  const checkAIServiceHealth = async () => {
    try {
      console.log("🔍 Checking AI service health...");
      const health = await aiTestCaseApi.getServiceHealth();
      console.log("✅ AI service health check result:", health);
      setAiServiceStatus(health.status);
    } catch (error) {
      console.error("❌ AI service health check failed:", error);
      setAiServiceStatus("unhealthy");
    }
  };

  // Handle button click to prevent form submission
  const handleGenerateClick = async () => {
    try {
      // Get form values manually
      const values = await form.validateFields();
      console.log("🎯 Button clicked, form values:", values);

      // Call the actual generation function
      await generateTestCases(values);
    } catch (error) {
      console.error("❌ Form validation failed:", error);
      message.error("Vui lòng kiểm tra lại thông tin đã nhập!");
    }
  };

  // AI Service Call
  const generateTestCases = async (values) => {
    console.log("🚀 Starting AI test case generation with values:", values);
    let progressInterval = null;
    try {
      // Validate basic information first
      const validation = validateBasicInformation(values);
      console.log("📋 Validation result:", validation);

      if (!validation.isValid) {
        console.log("❌ Validation failed, showing error message");
        message.error({
          content: (
            <div>
              <p>
                <strong>
                  ❌ Vui lòng hoàn thiện thông tin cơ bản trước khi tạo test
                  cases:
                </strong>
              </p>
              <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          ),
          duration: 8,
        });
        return;
      }

      console.log("✅ Validation passed, starting AI generation");
      setLoading(true);
      setProgress(0);

      // Simulate progress updates
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 1000);
      console.log("⏱️ Progress interval started:", progressInterval);

      // Get function signature info
      const functionInfo = extractFunctionSignatureInfo();
      console.log("🔧 Function signature info:", functionInfo);

      const requestData = {
        ...validation.data,
        functionSignature: functionInfo,
      };

      console.log("🤖 Calling AI service with validated data:", requestData);
      console.log("🌐 AI Service URL check:", window.location.hostname);

      const response = await aiTestCaseApi.generateTestCases(requestData);
      console.log("📥 AI service response received:", response);

      // Transform AI response to system format
      const transformedTestCases =
        aiTestCaseApi.transformAIResponseToSystemFormat(response, functionInfo);

      // Validate generated test cases
      const testCaseValidation = aiTestCaseApi.validateAITestCases(
        transformedTestCases,
        functionInfo
      );

      if (!testCaseValidation.isValid) {
        message.error(
          `❌ Test cases không hợp lệ: ${testCaseValidation.errors.join(", ")}`
        );
        return;
      }

      if (testCaseValidation.warnings.length > 0) {
        message.warning(
          `⚠️ Cảnh báo: ${testCaseValidation.warnings.join(", ")}`
        );
      }

      setGeneratedTestCases(transformedTestCases);
      setShowPreview(true);

      if (progressInterval) {
        clearInterval(progressInterval);
        console.log("⏱️ Progress interval cleared (success)");
      }
      setProgress(100);

      message.success({
        content: `🎉 AI đã tạo thành công ${transformedTestCases.length} test cases!`,
        duration: 3,
      });
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
        console.log("⏱️ Progress interval cleared (error)");
      }
      console.error("❌ Error generating test cases:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response,
        request: error.request,
        code: error.code,
      });

      // Fallback với sample data
      console.log("🔄 Using fallback test cases due to error:", error.message);
      const fallbackTestCases = aiTestCaseApi.generateFallbackTestCases(
        values.numberOfTestCases || 5,
        "general"
      );
      console.log("📝 Generated fallback test cases:", fallbackTestCases);

      setGeneratedTestCases(fallbackTestCases);
      setShowPreview(true);

      message.warning({
        content: (
          <div>
            <p>
              <strong>⚠️ AI service tạm thời không khả dụng</strong>
            </p>
            <p>
              Đã tạo {fallbackTestCases.length} test cases mẫu để bạn có thể
              tiếp tục làm việc.
            </p>
            <p className="text-sm mt-1">
              💡 Bạn có thể chỉnh sửa các test cases này theo nhu cầu.
            </p>
          </div>
        ),
        duration: 8,
      });
    } finally {
      console.log("🏁 AI generation process finished");
      setLoading(false);
      setProgress(0);
    }
  };

  // Handle test case editing
  const handleEditTestCase = (index) => {
    console.log("🔧 Edit test case clicked, index:", index);
    console.log("📝 Generated test cases:", generatedTestCases);

    if (!generatedTestCases || index >= generatedTestCases.length) {
      console.error("❌ Invalid index or no test cases");
      message.error("Không thể chỉnh sửa test case này!");
      return;
    }

    const testCase = generatedTestCases[index];
    console.log("📋 Test case to edit:", testCase);

    editForm.setFieldsValue({
      description: testCase.description,
      inputData: testCase.inputData,
      expectedOutputData: testCase.expectedOutputData,
      timeLimit: testCase.timeLimit,
      memoryLimit: testCase.memoryLimit,
      weight: testCase.weight,
      isExample: testCase.isExample,
      isHidden: testCase.isHidden,
    });
    setEditingIndex(index);
    console.log("✅ Edit modal should open, editingIndex set to:", index);
  };

  const handleSaveEdit = async () => {
    console.log("💾 Save edit clicked, editingIndex:", editingIndex);

    try {
      const values = await editForm.validateFields();
      console.log("📝 Form values from edit modal:", values);

      if (
        editingIndex === null ||
        editingIndex < 0 ||
        editingIndex >= generatedTestCases.length
      ) {
        console.error("❌ Invalid editing index:", editingIndex);
        message.error("Lỗi: Không thể xác định test case cần chỉnh sửa!");
        return;
      }

      const updatedTestCases = [...generatedTestCases];
      const originalTestCase = updatedTestCases[editingIndex];
      console.log("📋 Original test case:", originalTestCase);

      updatedTestCases[editingIndex] = {
        ...originalTestCase,
        ...values,
        // Preserve essential fields that shouldn't be overwritten
        key: originalTestCase.key,
        testOrder: originalTestCase.testOrder,
        inputType: originalTestCase.inputType,
        outputType: originalTestCase.outputType,
        comparisonMode: originalTestCase.comparisonMode || "EXACT",
      };

      console.log("📝 Updated test case:", updatedTestCases[editingIndex]);
      console.log("📝 All updated test cases:", updatedTestCases);

      setGeneratedTestCases(updatedTestCases);
      setEditingIndex(null);
      editForm.resetFields();
      message.success("✅ Đã cập nhật test case thành công!");
    } catch (error) {
      console.error("❌ Edit validation error:", error);
      message.error(
        "Có lỗi xảy ra khi lưu test case. Vui lòng kiểm tra lại thông tin!"
      );
    }
  };

  const handleDeleteTestCase = (index) => {
    console.log("🗑️ Delete test case clicked, index:", index);
    console.log("📝 Generated test cases:", generatedTestCases);
    console.log("📊 Total test cases:", generatedTestCases.length);

    if (
      !generatedTestCases ||
      index < 0 ||
      index >= generatedTestCases.length
    ) {
      console.error("❌ Invalid index or no test cases");
      message.error("Không thể xóa test case này! Index không hợp lệ.");
      return;
    }

    const testCaseToDelete = generatedTestCases[index];
    console.log("📋 Test case to delete:", testCaseToDelete);

    Modal.confirm({
      title: "🗑️ Xóa Test Case",
      content: (
        <div>
          <p>Bạn có chắc chắn muốn xóa test case này?</p>
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <p>
              <strong>Mô tả:</strong> {testCaseToDelete.description}
            </p>
            <p>
              <strong>Vị trí:</strong> #{index + 1}
            </p>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Thao tác này không thể hoàn tác.
          </p>
        </div>
      ),
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      width: 500,
      onOk: () => {
        console.log("✅ User confirmed delete for index:", index);

        try {
          const updatedTestCases = generatedTestCases.filter(
            (_, i) => i !== index
          );
          console.log("📝 Updated test cases after delete:", updatedTestCases);
          console.log("📊 New total count:", updatedTestCases.length);

          setGeneratedTestCases(updatedTestCases);
          message.success(`🗑️ Đã xóa test case #${index + 1} thành công!`);

          // Log final state
          console.log("✅ Delete operation completed successfully");
        } catch (error) {
          console.error("❌ Error during delete operation:", error);
          message.error("Có lỗi xảy ra khi xóa test case!");
        }
      },
      onCancel: () => {
        console.log("❌ User cancelled delete operation");
      },
    });
  };

  const handleApplyTestCases = () => {
    console.log("🎯 Áp dụng tất cả test cases");
    console.log("📝 Test cases sẽ áp dụng:", generatedTestCases);

    // Kiểm tra cơ bản
    if (!generatedTestCases || generatedTestCases.length === 0) {
      message.warning("Không có test cases nào để áp dụng!");
      return;
    }

    if (!onTestCasesGenerated) {
      message.error("Lỗi: Không thể kết nối với form chính!");
      return;
    }

    // Áp dụng trực tiếp không cần modal xác nhận
    console.log("🔍 Step 4: About to apply test cases directly...");
    try {
      console.log("📤 Đang gọi onTestCasesGenerated...");
      console.log("📤 Test cases to send:", generatedTestCases);

      onTestCasesGenerated(generatedTestCases);
      console.log("✅ onTestCasesGenerated called successfully");

      // Reset state
      setShowPreview(false);
      setGeneratedTestCases([]);
      form.resetFields();

      message.success(
        `🎉 Đã thêm ${generatedTestCases.length} test cases vào form chính!`
      );

      console.log("✅ Apply process completed successfully");
    } catch (error) {
      console.error("❌ Lỗi khi áp dụng test cases:", error);
      message.error("Có lỗi xảy ra! Vui lòng thử lại.");
    }
  };

  // Table columns for preview
  const columns = [
    {
      title: "#",
      dataIndex: "testOrder",
      key: "testOrder",
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: "Input",
      dataIndex: "inputData",
      key: "inputData",
      width: 150,
      ellipsis: true,
      render: (text) => {
        try {
          const parsed = JSON.parse(text);
          const display = Array.isArray(parsed)
            ? parsed.map((p) => p.input).join(", ")
            : text;
          return (
            <Tooltip title={text}>
              <code className="text-xs bg-gray-100 px-1 rounded">
                {display}
              </code>
            </Tooltip>
          );
        } catch {
          return (
            <code className="text-xs bg-gray-100 px-1 rounded">{text}</code>
          );
        }
      },
    },
    {
      title: "Output",
      dataIndex: "expectedOutputData",
      key: "expectedOutputData",
      width: 150,
      ellipsis: true,
      render: (text) => {
        try {
          const parsed = JSON.parse(text);
          const display = parsed.expectedOutput || text;
          return (
            <Tooltip title={text}>
              <code className="text-xs bg-gray-100 px-1 rounded">
                {display}
              </code>
            </Tooltip>
          );
        } catch {
          return (
            <code className="text-xs bg-gray-100 px-1 rounded">{text}</code>
          );
        }
      },
    },
    {
      title: "Loại",
      key: "type",
      width: 100,
      render: (_, record) => (
        <Space>
          {record.isExample && <Tag color="blue">Ví dụ</Tag>}
          {record.isHidden && <Tag color="orange">Ẩn</Tag>}
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record, index) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditTestCase(index)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                console.log("🔥 DELETE BUTTON CLICKED - Index:", index);
                console.log(
                  "🔥 handleDeleteTestCase function:",
                  handleDeleteTestCase
                );
                console.log(
                  "🔥 generatedTestCases length:",
                  generatedTestCases.length
                );
                handleDeleteTestCase(index);
              }}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const renderServiceStatus = () => {
    const statusConfig = {
      healthy: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "AI Service hoạt động tốt",
      },
      unhealthy: {
        color: "error",
        icon: <ExclamationCircleOutlined />,
        text: "AI Service không khả dụng",
      },
      unknown: {
        color: "default",
        icon: <ReloadOutlined />,
        text: "Đang kiểm tra...",
      },
    };

    const config = statusConfig[aiServiceStatus];
    return (
      <Space>
        <Tag color={config.color} icon={config.icon}>
          {config.text}
        </Tag>
        <Button
          type="text"
          size="small"
          icon={<ReloadOutlined />}
          onClick={checkAIServiceHealth}
          title="Kiểm tra lại trạng thái AI service"
        >
          Kiểm tra lại
        </Button>
      </Space>
    );
  };

  return (
    <div className="space-y-4">
      {/* Service Status */}
      <Alert
        message="🤖 AI Test Case Generation"
        description={
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Trạng thái dịch vụ AI:</span>
              {renderServiceStatus()}
            </div>
            <p>
              Sử dụng AI để tự động tạo test cases đa dạng và chất lượng cao cho
              bài toán của bạn.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <strong>Thông minh:</strong> AI phân tích bài toán và tạo test
                cases phù hợp
              </li>
              <li>
                <strong>Đa dạng:</strong> Bao gồm cả basic cases và edge cases
              </li>
              <li>
                <strong>Có thể chỉnh sửa:</strong> Review và tùy chỉnh trước khi
                áp dụng
              </li>
              <li>
                <strong>Fallback:</strong> Tự động tạo mẫu khi AI service không
                khả dụng
              </li>
            </ul>
          </div>
        }
        type="info"
        showIcon
      />

      {/* Validation Requirements */}
      <Alert
        message="📋 Yêu cầu thông tin cơ bản"
        description={
          <div className="space-y-2">
            <p>
              Để sử dụng AI tạo test cases, vui lòng đảm bảo các thông tin bắt
              buộc sau đã được điền đầy đủ:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    problemTitle && problemTitle.trim().length >= 5
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></span>
                <span>Tiêu đề bài toán (≥ 5 ký tự)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    problemDescription && problemDescription.trim().length >= 20
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                ></span>
                <span>Mô tả bài toán (≥ 20 ký tự)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    constraints && constraints.trim().length > 0
                      ? "bg-green-500"
                      : "bg-yellow-500"
                  }`}
                ></span>
                <span>Ràng buộc và giới hạn (tùy chọn)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Số lượng test cases (1-20)</span>
              </div>
            </div>
            {validationStatus && !validationStatus.isValid && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700 font-medium">
                  ⚠️ Thông tin chưa đầy đủ:
                </p>
                <ul className="list-disc pl-5 text-red-600 text-sm">
                  {validationStatus.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {validationStatus && validationStatus.isValid && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                <p className="text-green-700 font-medium">
                  ✅ Thông tin đã đầy đủ, sẵn sàng tạo test cases!
                </p>
                <p className="text-green-600 text-sm mt-1">
                  💡 Mẹo: Thêm ràng buộc và giới hạn sẽ giúp AI tạo test cases
                  chính xác hơn
                </p>
              </div>
            )}
          </div>
        }
        type={
          validationStatus && validationStatus.isValid ? "success" : "warning"
        }
        showIcon
      />

      {/* Generation Form */}
      <Card title="📝 Thông tin bài toán" className="shadow-sm">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            numberOfTestCases: 5,
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customTitle"
                label="Tiêu đề bài toán"
                tooltip="Sẽ sử dụng tiêu đề từ form chính nếu để trống"
              >
                <Input
                  placeholder={problemTitle || "Nhập tiêu đề bài toán..."}
                  disabled={!!problemTitle}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="numberOfTestCases"
                label="Số lượng test cases"
                rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
              >
                <InputNumber
                  min={1}
                  max={20}
                  style={{ width: "100%" }}
                  placeholder="Nhập số lượng (1-20)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="customDescription"
            label="Mô tả bài toán"
            tooltip="Sẽ sử dụng mô tả từ form chính nếu để trống"
          >
            <TextArea
              rows={4}
              placeholder={
                problemDescription || "Nhập mô tả chi tiết bài toán..."
              }
              disabled={!!problemDescription}
            />
          </Form.Item>

          <Form.Item
            name="customConstraints"
            label="Ràng buộc và giới hạn"
            tooltip="Sẽ sử dụng constraints từ form chính nếu để trống"
          >
            <TextArea
              rows={2}
              placeholder={constraints || "Nhập các ràng buộc và giới hạn..."}
              disabled={!!constraints}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              loading={loading}
              disabled={
                disabled || (validationStatus && !validationStatus.isValid)
              }
              icon={<RobotOutlined />}
              size="large"
              block
              title={
                validationStatus && !validationStatus.isValid
                  ? "Vui lòng hoàn thiện thông tin cơ bản trước khi tạo test cases"
                  : "Tạo test cases bằng AI"
              }
              onClick={handleGenerateClick}
            >
              {loading
                ? "AI đang tạo test cases..."
                : validationStatus && !validationStatus.isValid
                ? "⚠️ Hoàn thiện thông tin để tạo Test Cases"
                : "🚀 Tạo Test Cases bằng AI"}
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="text-center">
          <Spin size="large" />
          <div className="mt-4">
            <Progress percent={Math.round(progress)} status="active" />
            <p className="text-gray-600 mt-2">
              🤖 AI đang phân tích bài toán và sinh test cases...
            </p>
            <p className="text-sm text-gray-500">
              Quá trình này có thể mất 10-30 giây
            </p>
          </div>
        </Card>
      )}

      {/* Preview Results */}
      {showPreview && generatedTestCases.length > 0 && (
        <Card
          title={`🎯 Preview: ${generatedTestCases.length} Test Cases được tạo`}
          className="shadow-sm"
          extra={
            <Space>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  console.log("🔥 BUTTON CLICKED - Áp dụng tất cả");
                  console.log(
                    "🔥 handleApplyTestCases function:",
                    handleApplyTestCases
                  );
                  console.log("🔥 generatedTestCases:", generatedTestCases);
                  console.log(
                    "🔥 onTestCasesGenerated prop:",
                    onTestCasesGenerated
                  );
                  handleApplyTestCases();
                }}
              >
                Áp dụng tất cả
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false);
                  setGeneratedTestCases([]);
                }}
              >
                Hủy
              </Button>
            </Space>
          }
        >
          <Table
            columns={columns}
            dataSource={generatedTestCases}
            rowKey={(_, index) => `testcase-${index}`}
            pagination={{ pageSize: 5 }}
            size="small"
            scroll={{ x: 800 }}
          />
        </Card>
      )}

      {/* Edit Modal */}
      <Modal
        title="✏️ Chỉnh sửa Test Case"
        open={editingIndex !== null}
        onOk={handleSaveEdit}
        onCancel={() => setEditingIndex(null)}
        okText="Lưu"
        cancelText="Hủy"
        width={800}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true }]}
          >
            <Input placeholder="Mô tả test case" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="inputData"
                label="Input Data"
                rules={[{ required: true }]}
              >
                <TextArea rows={3} placeholder="JSON format input data" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expectedOutputData"
                label="Expected Output"
                rules={[{ required: true }]}
              >
                <TextArea rows={3} placeholder="JSON format expected output" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="timeLimit" label="Giới hạn thời gian (ms)">
                <InputNumber min={100} max={10000} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="memoryLimit" label="Giới hạn bộ nhớ (KB)">
                <InputNumber
                  min={1024}
                  max={1048576}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="weight" label="Trọng số">
                <InputNumber
                  min={0.1}
                  max={10}
                  step={0.1}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isExample"
                label="Loại test case"
                valuePropName="checked"
              >
                <Checkbox>Đây là test case ví dụ</Checkbox>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isHidden" label=" " valuePropName="checked">
                <Checkbox>Ẩn test case này</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default AITestCaseGenerationTab;
