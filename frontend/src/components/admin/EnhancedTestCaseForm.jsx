import React, { useState, useEffect } from "react";
import {
  Form,
  Card,
  Button,
  Space,
  Alert,
  Progress,
  Statistic,
  Row,
  Col,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import SmartTestCaseValidator from "./SmartTestCaseValidator";

const EnhancedTestCaseForm = ({ form, onTestCasesChange }) => {
  const [testCases, setTestCases] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    examples: 0,
    hidden: 0,
  });

  // Enhanced sync with form data - better handling of imported test cases
  useEffect(() => {
    const formTestCases = form.getFieldValue("testCases") || [];
    setTestCases(formTestCases);
    updateStats(formTestCases);
  }, [form]);

  // Additional effect to watch for form field changes and imported test cases
  useEffect(() => {
    const handleFormChange = () => {
      const formTestCases = form.getFieldValue("testCases") || [];
      if (JSON.stringify(formTestCases) !== JSON.stringify(testCases)) {
        setTestCases(formTestCases);
        updateStats(formTestCases);
      }
    };

    // Set up a listener for form changes to catch imported test cases
    const interval = setInterval(handleFormChange, 100);
    return () => clearInterval(interval);
  }, [form, testCases]);

  const updateStats = (testCaseList) => {
    const newStats = {
      total: testCaseList.length,
      valid: testCaseList.filter(
        (tc) => tc.description && tc.inputData && tc.expectedOutputData
      ).length,
      examples: testCaseList.filter((tc) => tc.isExample).length,
      hidden: testCaseList.filter((tc) => tc.isHidden).length,
    };
    setStats(newStats);
  };

  const handleTestCasesUpdate = (newTestCases) => {
    setTestCases(newTestCases);
    form.setFieldValue("testCases", newTestCases);
    updateStats(newTestCases);
    onTestCasesChange?.(newTestCases);
  };

  const addTestCase = () => {
    const newTestCase = {
      inputData: JSON.stringify([{ input: "", dataType: "string" }]),
      inputType: "string",
      outputType: "string",
      expectedOutputData: JSON.stringify({
        expectedOutput: "",
        dataType: "string",
      }),
      description: `Test case ${testCases.length + 1}`,
      isExample: testCases.length === 0,
      isHidden: false,
      timeLimit: 1000,
      memoryLimit: 262144,
      weight: 1.0,
      testOrder: testCases.length + 1,
      comparisonMode: "EXACT",
      epsilon: null,
    };

    const updatedTestCases = [...testCases, newTestCase];
    handleTestCasesUpdate(updatedTestCases);
    message.success("Đã thêm test case mới!");
  };

  const duplicateTestCase = (index) => {
    const originalTestCase = testCases[index];
    const duplicatedTestCase = {
      ...originalTestCase,
      description: `${originalTestCase.description} (Bản sao)`,
      testOrder: testCases.length + 1,
    };

    const updatedTestCases = [...testCases, duplicatedTestCase];
    handleTestCasesUpdate(updatedTestCases);
    message.success("Đã nhân bản test case!");
  };

  const removeTestCase = (index) => {
    const updatedTestCases = testCases.filter((_, i) => i !== index);
    // Update test orders
    const reorderedTestCases = updatedTestCases.map((tc, i) => ({
      ...tc,
      testOrder: i + 1,
    }));
    handleTestCasesUpdate(reorderedTestCases);
    message.success("Đã xóa test case!");
  };

  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[index] = {
      ...updatedTestCases[index],
      [field]: value,
    };
    handleTestCasesUpdate(updatedTestCases);
  };

  const renderStatsBar = () => (
    <Card className="mb-4">
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="Tổng"
            value={stats.total}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: "#1890ff" }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Hợp lệ"
            value={stats.valid}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Ví dụ"
            value={stats.examples}
            valueStyle={{ color: "#fa8c16" }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Ẩn"
            value={stats.hidden}
            valueStyle={{ color: "#722ed1" }}
          />
        </Col>
      </Row>

      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span>Điểm chất lượng</span>
          <span className="font-semibold">
            {stats.total > 0
              ? Math.round((stats.valid / stats.total) * 100)
              : 0}
            %
          </span>
        </div>
        <Progress
          percent={stats.total > 0 ? (stats.valid / stats.total) * 100 : 0}
          status={stats.valid === stats.total ? "success" : "active"}
        />
      </div>
    </Card>
  );

  const renderTestCaseCard = (testCase, index) => (
    <Card
      key={index}
      className="mb-4"
      title={
        <div className="flex justify-between items-center">
          <span>Test Case #{index + 1}</span>
          <Space>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={() => duplicateTestCase(index)}
            >
              Nhân bản
            </Button>
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa test case này?"
              onConfirm={() => removeTestCase(index)}
              okText="Có"
              cancelText="Không"
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        </div>
      }
    >
      <SmartTestCaseValidator
        testCase={testCase}
        index={index}
        onChange={handleTestCaseChange}
      />
    </Card>
  );

  if (testCases.length === 0) {
    return (
      <div className="text-center py-8">
        <Alert
          message="Chưa có test case nào"
          description="Bắt đầu bằng cách thêm test case đầu tiên hoặc sử dụng Tạo nhanh để tạo test cases tự động"
          type="info"
          showIcon
          className="mb-4"
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={addTestCase}>
          Thêm Test Case đầu tiên
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {renderStatsBar()}

      <div className="space-y-4">
        {testCases.map((testCase, index) =>
          renderTestCaseCard(testCase, index)
        )}
      </div>

      <Card>
        <div className="text-center">
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addTestCase}
            size="large"
            block
          >
            Thêm Test Case khác
          </Button>
        </div>
      </Card>

      {stats.total > 0 && (
        <Alert
          message={`Bạn có ${stats.total} test cases với ${stats.valid} test cases hợp lệ`}
          description={
            stats.valid < stats.total
              ? "Một số test cases cần chú ý. Kiểm tra thông báo validation ở trên."
              : "Tất cả test cases đều hợp lệ! Làm tốt lắm!"
          }
          type={stats.valid === stats.total ? "success" : "warning"}
          showIcon
        />
      )}
    </div>
  );
};

export default EnhancedTestCaseForm;
