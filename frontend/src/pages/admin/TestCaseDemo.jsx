import React, { useState } from "react";
import {
  Form,
  Card,
  Button,
  message,
  Alert,
  Space,
  Statistic,
  Row,
  Col,
} from "antd";
import {
  RocketOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import SuperchargedTestCaseManager from "../../components/admin/SuperchargedTestCaseManager";

const TestCaseDemo = () => {
  const [form] = Form.useForm();
  const [testCaseStats, setTestCaseStats] = useState({
    total: 0,
    valid: 0,
    examples: 0,
    hidden: 0,
  });

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const testCases = values.testCases || [];

      console.log("Form values:", values);
      console.log("Test cases:", testCases);

      message.success({
        content: `🎉 Đã lưu ${testCases.length} test cases thành công!`,
        duration: 3,
      });
    } catch (error) {
      message.error("Vui lòng kiểm tra lại test cases");
    }
  };

  const handleTestCasesChange = (testCases) => {
    console.log("Test cases updated:", testCases);

    // Update statistics
    const stats = {
      total: testCases.length,
      valid: testCases.filter(
        (tc) => tc.description && tc.inputData && tc.expectedOutputData
      ).length,
      examples: testCases.filter((tc) => tc.isExample).length,
      hidden: testCases.filter((tc) => tc.isHidden).length,
    };

    setTestCaseStats(stats);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-3">🧪 Test Case Manager Demo</h1>
          <p className="text-lg text-gray-600 mb-4">
            Trải nghiệm hệ thống quản lý test case nâng cấp với đầy đủ tính năng
            mới
          </p>

          <Alert
            message="🚀 Hệ thống Test Case Management thế hệ mới"
            description="Tạo test cases nhanh chóng, chính xác và chuyên nghiệp với công nghệ tiên tiến"
            type="info"
            showIcon
            className="mb-4"
          />
        </div>
      </Card>

      {/* Features Overview */}
      <Card title="✨ Tính năng nổi bật" className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center bg-blue-50 border-blue-200">
              <RocketOutlined className="text-3xl text-blue-600 mb-2" />
              <h4 className="font-semibold text-blue-800">Quick Generation</h4>
              <p className="text-sm text-blue-600">
                Templates, bulk input, CSV import
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="text-center bg-green-50 border-green-200">
              <CheckCircleOutlined className="text-3xl text-green-600 mb-2" />
              <h4 className="font-semibold text-green-800">Smart Validation</h4>
              <p className="text-sm text-green-600">
                Real-time validation & auto-fix
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="text-center bg-orange-50 border-orange-200">
              <BulbOutlined className="text-3xl text-orange-600 mb-2" />
              <h4 className="font-semibold text-orange-800">
                Batch Operations
              </h4>
              <p className="text-sm text-orange-600">
                Bulk edit, import/export
              </p>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card className="text-center bg-purple-50 border-purple-200">
              <BarChartOutlined className="text-3xl text-purple-600 mb-2" />
              <h4 className="font-semibold text-purple-800">Analytics</h4>
              <p className="text-sm text-purple-600">
                Quality analysis & insights
              </p>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      <Card title="📊 Thống kê Test Cases" className="mb-6">
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Tổng số"
              value={testCaseStats.total}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Hợp lệ"
              value={testCaseStats.valid}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Ví dụ"
              value={testCaseStats.examples}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Ẩn"
              value={testCaseStats.hidden}
              valueStyle={{ color: "#722ed1" }}
            />
          </Col>
        </Row>
      </Card>

      {/* Main Demo */}
      <Form form={form} layout="vertical">
        <SuperchargedTestCaseManager
          form={form}
          onTestCasesChange={handleTestCasesChange}
        />

        <Card className="mt-6">
          <div className="text-center">
            <Space size="large">
              <Button
                type="primary"
                size="large"
                onClick={handleSubmit}
                icon={<CheckCircleOutlined />}
              >
                💾 Lưu Test Cases
              </Button>

              <Button
                size="large"
                onClick={() => {
                  form.resetFields();
                  setTestCaseStats({
                    total: 0,
                    valid: 0,
                    examples: 0,
                    hidden: 0,
                  });
                  message.info("Đã reset form");
                }}
              >
                🔄 Reset Demo
              </Button>
            </Space>
          </div>
        </Card>
      </Form>

      {/* Instructions */}
      <Card title="📖 Hướng dẫn sử dụng" className="mt-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-blue-600">1. Quick Generate:</h4>
            <p>
              Sử dụng templates có sẵn hoặc nhập bulk text để tạo test cases
              nhanh
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-green-600">
              2. Advanced Templates:
            </h4>
            <p>
              Chọn từ các pattern thuật toán chuyên nghiệp (DP, Graph, Tree,
              etc.)
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-orange-600">3. Manual Editor:</h4>
            <p>
              Tạo và chỉnh sửa test cases thủ công với validation thông minh
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-purple-600">4. Analytics:</h4>
            <p>Xem phân tích chất lượng và nhận gợi ý cải thiện</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TestCaseDemo;
