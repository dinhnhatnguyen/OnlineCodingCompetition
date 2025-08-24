import React, { useState } from 'react';
import { Button, Card, Alert, Space, Typography, Input, InputNumber } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { aiTestCaseApi } from '../../api/aiTestCaseApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * Simple AI Test Component để debug AI integration
 */
const AITestSimple = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: 'Tính tổng hai số',
    description: 'Viết một hàm nhận vào hai số nguyên a và b, trả về tổng của chúng.',
    constraints: 'Giới hạn: -10^9 ≤ a, b ≤ 10^9',
    numberOfTestCases: 3
  });

  const testAIGeneration = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Starting AI test with data:', formData);
      
      // Step 1: Test health
      console.log('Step 1: Testing health...');
      const health = await aiTestCaseApi.getServiceHealth();
      console.log('Health result:', health);

      // Step 2: Generate test cases
      console.log('Step 2: Generating test cases...');
      const aiResponse = await aiTestCaseApi.generateTestCases(formData);
      console.log('AI Response:', aiResponse);

      // Step 3: Transform response
      console.log('Step 3: Transforming response...');
      const transformed = aiTestCaseApi.transformAIResponseToSystemFormat(aiResponse);
      console.log('Transformed:', transformed);

      // Step 4: Validate
      console.log('Step 4: Validating...');
      const validation = aiTestCaseApi.validateAITestCases(transformed);
      console.log('Validation:', validation);

      setResult({
        health,
        aiResponse,
        transformed,
        validation,
        success: true
      });

    } catch (err) {
      console.error('❌ AI test failed:', err);
      setError(err.message);
      
      // Try fallback
      try {
        console.log('Trying fallback...');
        const fallback = aiTestCaseApi.generateFallbackTestCases(formData.numberOfTestCases, 'math');
        console.log('Fallback result:', fallback);
        
        setResult({
          error: err.message,
          fallback,
          success: false
        });
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    return (
      <Card title="🎯 Test Results" className="mt-4">
        {result.success ? (
          <Alert
            message="✅ AI Test Successful!"
            description={
              <div className="space-y-2">
                <p><strong>Health:</strong> {result.health?.status}</p>
                <p><strong>AI Response:</strong> {result.aiResponse?.length} test cases generated</p>
                <p><strong>Transformed:</strong> {result.transformed?.length} test cases transformed</p>
                <p><strong>Validation:</strong> {result.validation?.isValid ? 'Valid' : 'Invalid'}</p>
                {result.validation?.errors?.length > 0 && (
                  <p><strong>Errors:</strong> {result.validation.errors.join(', ')}</p>
                )}
                {result.validation?.warnings?.length > 0 && (
                  <p><strong>Warnings:</strong> {result.validation.warnings.join(', ')}</p>
                )}
              </div>
            }
            type="success"
            showIcon
          />
        ) : (
          <Alert
            message="❌ AI Test Failed"
            description={
              <div className="space-y-2">
                <p><strong>Error:</strong> {result.error}</p>
                {result.fallback && (
                  <p><strong>Fallback:</strong> {result.fallback.length} fallback test cases generated</p>
                )}
              </div>
            }
            type="error"
            showIcon
          />
        )}

        {/* Show sample transformed data */}
        {result.transformed && result.transformed.length > 0 && (
          <div className="mt-4">
            <Text strong>Sample Transformed Test Case:</Text>
            <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-x-auto">
              {JSON.stringify(result.transformed[0], null, 2)}
            </pre>
          </div>
        )}

        {/* Show sample fallback data */}
        {result.fallback && result.fallback.length > 0 && (
          <div className="mt-4">
            <Text strong>Sample Fallback Test Case:</Text>
            <pre className="bg-gray-100 p-2 rounded mt-2 text-xs overflow-x-auto">
              {JSON.stringify(result.fallback[0], null, 2)}
            </pre>
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <Title level={2}>🧪 AI Integration Simple Test</Title>
        
        <div className="space-y-4">
          <Alert
            message="🔧 Debug Tool"
            description="Component này dùng để test trực tiếp AI integration. Mở Console (F12) để xem logs chi tiết."
            type="info"
            showIcon
          />

          {/* Form inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề:</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Nhập tiêu đề bài toán"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Số lượng test cases:</label>
              <InputNumber
                min={1}
                max={10}
                value={formData.numberOfTestCases}
                onChange={(value) => setFormData({...formData, numberOfTestCases: value})}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mô tả:</label>
            <TextArea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Nhập mô tả bài toán"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ràng buộc:</label>
            <TextArea
              rows={2}
              value={formData.constraints}
              onChange={(e) => setFormData({...formData, constraints: e.target.value})}
              placeholder="Nhập ràng buộc"
            />
          </div>

          {/* Test button */}
          <div className="text-center">
            <Button
              type="primary"
              size="large"
              icon={<RobotOutlined />}
              loading={loading}
              onClick={testAIGeneration}
            >
              {loading ? 'Đang test AI...' : '🚀 Test AI Generation'}
            </Button>
          </div>

          {/* Error display */}
          {error && (
            <Alert
              message="❌ Test Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          {/* Results */}
          {renderResult()}

          {/* Debug info */}
          <Card title="🔍 Debug Info" size="small">
            <div className="space-y-2 text-sm">
              <p><strong>Current URL:</strong> {window.location.href}</p>
              <p><strong>AI Service URL:</strong> http://localhost:3000</p>
              <p><strong>Available API methods:</strong> {Object.keys(aiTestCaseApi).join(', ')}</p>
            </div>
          </Card>

          {/* Instructions */}
          <Card title="📋 Instructions" size="small">
            <div className="space-y-2 text-sm">
              <p>1. Đảm bảo RecommendationSystem đang chạy trên port 3000</p>
              <p>2. Mở Console (F12) để xem logs chi tiết</p>
              <p>3. Nhấn "Test AI Generation" để test toàn bộ workflow</p>
              <p>4. Kiểm tra kết quả và debug nếu có lỗi</p>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default AITestSimple;
