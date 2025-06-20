import React, { useState } from 'react';
import { Card, Button, Space, Alert, Divider, Typography } from 'antd';
import { Form } from 'antd';
import SuperchargedTestCaseManager from './SuperchargedTestCaseManager';

const { Title, Paragraph, Text } = Typography;

/**
 * Demo component để test AI Test Case Generation workflow
 * Mô phỏng việc tạo bài toán với AI test case generation
 */
const AITestCaseDemo = () => {
  const [form] = Form.useForm();
  const [demoStep, setDemoStep] = useState(1);
  const [testCases, setTestCases] = useState([]);

  // Simulate problem data
  const problemData = {
    title: 'Tính tổng hai số',
    description: 'Viết một hàm nhận vào hai số nguyên a và b, trả về tổng của chúng. Input gồm hai số nguyên a và b trên cùng một dòng, cách nhau bởi dấu cách. Output là một số nguyên duy nhất là tổng của a và b.',
    constraints: 'Giới hạn: -10^9 ≤ a, b ≤ 10^9'
  };

  // Set initial form values
  React.useEffect(() => {
    form.setFieldsValue(problemData);
  }, [form]);

  const handleTestCasesChange = (newTestCases) => {
    console.log('Demo - Test cases changed:', newTestCases);
    setTestCases(newTestCases);
  };

  const handleNextStep = () => {
    setDemoStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    setDemoStep(prev => prev - 1);
  };

  const handleReset = () => {
    setDemoStep(1);
    setTestCases([]);
    form.resetFields();
    form.setFieldsValue(problemData);
  };

  const renderStepContent = () => {
    switch (demoStep) {
      case 1:
        return (
          <Alert
            message="🎯 Bước 1: Thiết lập thông tin bài toán"
            description={
              <div className="space-y-2">
                <p>Chúng ta đã thiết lập một bài toán mẫu: <strong>"{problemData.title}"</strong></p>
                <p>Bây giờ hãy chuyển sang tab <strong>"AI Generation"</strong> để tạo test cases tự động.</p>
                <p className="text-blue-600">💡 AI sẽ sử dụng thông tin này để tạo test cases phù hợp.</p>
              </div>
            }
            type="info"
            showIcon
          />
        );
      
      case 2:
        return (
          <Alert
            message="🤖 Bước 2: Sử dụng AI Generation"
            description={
              <div className="space-y-2">
                <p>Trong tab <strong>"AI Generation"</strong>:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Kiểm tra thông tin bài toán đã được tự động điền</li>
                  <li>Chọn số lượng test cases muốn tạo (mặc định: 5)</li>
                  <li>Nhấn nút <strong>"🚀 Tạo Test Cases bằng AI"</strong></li>
                  <li>Chờ AI phân tích và tạo test cases</li>
                </ol>
                <p className="text-green-600">✅ AI sẽ tạo test cases đa dạng bao gồm cả edge cases.</p>
              </div>
            }
            type="success"
            showIcon
          />
        );
      
      case 3:
        return (
          <Alert
            message="✏️ Bước 3: Review và chỉnh sửa"
            description={
              <div className="space-y-2">
                <p>Sau khi AI tạo xong, bạn có thể:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Xem preview:</strong> Kiểm tra tất cả test cases được tạo</li>
                  <li><strong>Chỉnh sửa:</strong> Click icon ✏️ để sửa test case cụ thể</li>
                  <li><strong>Xóa:</strong> Click icon 🗑️ để xóa test case không cần thiết</li>
                  <li><strong>Áp dụng:</strong> Nhấn "Áp dụng tất cả" để thêm vào danh sách chính</li>
                </ul>
                <p className="text-orange-600">⚠️ Nếu AI service không khả dụng, hệ thống sẽ tự động tạo test cases mẫu.</p>
              </div>
            }
            type="warning"
            showIcon
          />
        );
      
      case 4:
        return (
          <Alert
            message="🎉 Bước 4: Hoàn thành và lưu"
            description={
              <div className="space-y-2">
                <p>Test cases đã được thêm vào danh sách chính!</p>
                <p>Bây giờ bạn có thể:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Chuyển sang tab <strong>"Chỉnh sửa thủ công"</strong> để tinh chỉnh thêm</li>
                  <li>Sử dụng tab <strong>"Thao tác hàng loạt"</strong> để chỉnh sửa nhiều test cases cùng lúc</li>
                  <li>Xem <strong>"Phân tích"</strong> để kiểm tra chất lượng test cases</li>
                  <li>Nhấn <strong>"Tạo bài toán"</strong> để lưu vào database</li>
                </ul>
                <p className="text-green-600">✅ Workflow hoàn tất! Test cases đã sẵn sàng để submit.</p>
              </div>
            }
            type="success"
            showIcon
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <Title level={2}>🧪 Demo: AI Test Case Generation Workflow</Title>
        <Paragraph>
          Demo này mô phỏng quy trình tạo test cases tự động bằng AI trong hệ thống tạo bài toán.
          Hãy làm theo các bước hướng dẫn để trải nghiệm workflow hoàn chỉnh.
        </Paragraph>
        
        <Divider />
        
        {renderStepContent()}
        
        <Divider />
        
        <div className="flex justify-between items-center">
          <Space>
            <Text strong>Bước {demoStep}/4</Text>
            <Text type="secondary">
              Test cases hiện tại: <strong>{testCases.length}</strong>
            </Text>
          </Space>
          
          <Space>
            <Button 
              onClick={handlePrevStep} 
              disabled={demoStep === 1}
            >
              ← Bước trước
            </Button>
            <Button 
              type="primary" 
              onClick={handleNextStep}
              disabled={demoStep === 4}
            >
              Bước tiếp →
            </Button>
            <Button onClick={handleReset}>
              🔄 Reset Demo
            </Button>
          </Space>
        </div>
      </Card>

      <Card title="🛠️ Test Case Manager" className="shadow-lg">
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="Tiêu đề bài toán" style={{ display: 'none' }}>
            <input type="hidden" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả bài toán" style={{ display: 'none' }}>
            <input type="hidden" />
          </Form.Item>
          <Form.Item name="constraints" label="Ràng buộc" style={{ display: 'none' }}>
            <input type="hidden" />
          </Form.Item>
          
          <SuperchargedTestCaseManager
            form={form}
            onTestCasesChange={handleTestCasesChange}
          />
        </Form>
      </Card>

      {testCases.length > 0 && (
        <Card title="📊 Kết quả Demo" className="bg-green-50">
          <Alert
            message={`🎉 Thành công! Đã tạo ${testCases.length} test cases`}
            description={
              <div className="space-y-2">
                <p>Test cases đã được tạo và sẵn sàng để sử dụng:</p>
                <ul className="list-disc pl-5">
                  {testCases.slice(0, 3).map((tc, index) => (
                    <li key={index}>
                      <strong>{tc.description}</strong> - 
                      {tc.isExample ? ' (Ví dụ)' : ''} 
                      {tc.isHidden ? ' (Ẩn)' : ''}
                    </li>
                  ))}
                  {testCases.length > 3 && (
                    <li>... và {testCases.length - 3} test cases khác</li>
                  )}
                </ul>
                <p className="text-sm text-gray-600 mt-2">
                  💡 Trong thực tế, bạn sẽ nhấn "Tạo bài toán" để lưu tất cả dữ liệu vào database.
                </p>
              </div>
            }
            type="success"
            showIcon
          />
        </Card>
      )}
    </div>
  );
};

export default AITestCaseDemo;
