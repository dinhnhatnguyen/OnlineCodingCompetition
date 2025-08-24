import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Space, Typography, Divider, Tag } from 'antd';
import { PlayCircleOutlined, BugOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { testAIAPIIntegration, testTransformFunction, debugAIIntegration } from '../../utils/testAIAPI';

const { Title, Paragraph, Text } = Typography;

/**
 * Component để test AI integration
 * Dùng để debug và kiểm tra AI API hoạt động
 */
const AITestPage = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    // Load debug info on mount
    const info = debugAIIntegration();
    setDebugInfo(info);
  }, []);

  const runFullTest = async () => {
    setLoading(true);
    try {
      const results = await testAIAPIIntegration();
      setTestResults(results);
    } catch (error) {
      setTestResults({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const runTransformTest = () => {
    const results = testTransformFunction();
    setTestResults({
      success: true,
      transformTest: results
    });
  };

  const renderTestResults = () => {
    if (!testResults) return null;

    if (testResults.success) {
      return (
        <Alert
          message="✅ Test thành công!"
          description={
            <div className="space-y-2">
              <p>AI API integration hoạt động tốt.</p>
              {testResults.health && (
                <p><strong>Health:</strong> {testResults.health.status}</p>
              )}
              {testResults.transformedTestCases && (
                <p><strong>Test cases generated:</strong> {testResults.transformedTestCases.length}</p>
              )}
              {testResults.validation && (
                <p><strong>Validation:</strong> {testResults.validation.isValid ? 'Passed' : 'Failed'}</p>
              )}
            </div>
          }
          type="success"
          showIcon
        />
      );
    } else {
      return (
        <Alert
          message="❌ Test thất bại"
          description={
            <div className="space-y-2">
              <p><strong>Error:</strong> {testResults.error}</p>
              {testResults.fallbackTestCases && (
                <p><strong>Fallback test cases:</strong> {testResults.fallbackTestCases.length} generated</p>
              )}
              <p className="text-sm text-gray-600">
                Kiểm tra xem RecommendationSystem có đang chạy trên port 3000 không.
              </p>
            </div>
          }
          type="error"
          showIcon
        />
      );
    }
  };

  const renderDebugInfo = () => {
    if (!debugInfo) return null;

    return (
      <Card title="🔍 Debug Information" size="small">
        <div className="space-y-2">
          <div>
            <Text strong>Current URL:</Text> <Text code>{debugInfo.currentURL}</Text>
          </div>
          <div>
            <Text strong>Hostname:</Text> <Text code>{debugInfo.hostname}</Text>
          </div>
          <div>
            <Text strong>AI Service URL:</Text> <Text code>{debugInfo.aiServiceURL}</Text>
          </div>
          <div>
            <Text strong>Available Methods:</Text>
            <div className="mt-1">
              {debugInfo.availableMethods.map(method => (
                <Tag key={method} color="blue" className="mb-1">{method}</Tag>
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <Title level={2}>🧪 AI Integration Test Page</Title>
        <Paragraph>
          Trang này dùng để test và debug AI Test Case Generation integration.
          Đảm bảo RecommendationSystem đang chạy trên port 3000 trước khi test.
        </Paragraph>

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Control Buttons */}
          <Space>
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={runFullTest}
              loading={loading}
              size="large"
            >
              🚀 Run Full API Test
            </Button>
            <Button
              icon={<BugOutlined />}
              onClick={runTransformTest}
            >
              🔄 Test Transform Only
            </Button>
            <Button
              onClick={() => {
                console.log('Opening browser console...');
                console.log('Available test functions:');
                console.log('- window.testAIAPI() - Full API test');
                console.log('- window.testTransform() - Transform test');
                console.log('- window.debugAI() - Debug info');
              }}
            >
              📝 Console Commands
            </Button>
          </Space>

          {/* Debug Info */}
          {renderDebugInfo()}

          {/* Test Results */}
          {renderTestResults()}

          {/* Instructions */}
          <Card title="📋 Instructions" size="small">
            <div className="space-y-2">
              <p><strong>1. Kiểm tra RecommendationSystem:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Đảm bảo RecommendationSystem đang chạy: <code>cd RecommendationSystem && python3 -m uvicorn app.main:app --host 0.0.0.0 --port 3000</code></li>
                <li>Test manual: <code>curl http://localhost:3000/</code></li>
              </ul>
              
              <p><strong>2. Test AI Integration:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nhấn "Run Full API Test" để test toàn bộ workflow</li>
                <li>Nhấn "Test Transform Only" để test chỉ transform function</li>
                <li>Mở Console (F12) và chạy <code>window.testAIAPI()</code></li>
              </ul>

              <p><strong>3. Troubleshooting:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Nếu có lỗi CORS: Thêm CORS headers vào RecommendationSystem</li>
                <li>Nếu có lỗi connection: Kiểm tra port 3000 có đang được sử dụng</li>
                <li>Nếu có lỗi transform: Kiểm tra format response từ AI</li>
              </ul>
            </div>
          </Card>

          {/* Quick Status */}
          <Card title="🎯 Quick Status Check" size="small">
            <Space>
              <Tag icon={<CheckCircleOutlined />} color="success">
                Frontend: Ready
              </Tag>
              <Tag icon={<ExclamationCircleOutlined />} color="warning">
                RecommendationSystem: Check manually
              </Tag>
              <Tag icon={<BugOutlined />} color="processing">
                Integration: Test required
              </Tag>
            </Space>
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default AITestPage;
