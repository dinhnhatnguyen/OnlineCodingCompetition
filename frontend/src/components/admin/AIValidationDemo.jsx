import React, { useState } from 'react';
import { Card, Input, Button, Space, Typography, Form } from 'antd';
import AITestCaseGenerationTab from './AITestCaseGenerationTab';

const { Title, Text } = Typography;
const { TextArea } = Input;

/**
 * Demo component để test AI validation
 */
const AIValidationDemo = () => {
  const [form] = Form.useForm();
  const [problemData, setProblemData] = useState({
    title: '',
    description: '',
    constraints: ''
  });

  const handleTestCasesGenerated = (testCases) => {
    console.log('Generated test cases:', testCases);
  };

  const presetExamples = {
    empty: {
      title: '',
      description: '',
      constraints: ''
    },
    incomplete: {
      title: 'Sum',
      description: 'Add two numbers',
      constraints: ''
    },
    complete: {
      title: 'Tính tổng hai số nguyên',
      description: 'Viết một hàm nhận vào hai số nguyên a và b, trả về tổng của chúng. Input gồm hai số nguyên a và b trên cùng một dòng, cách nhau bởi dấu cách. Output là một số nguyên duy nhất là tổng của a và b.',
      constraints: 'Giới hạn: -10^9 ≤ a, b ≤ 10^9. Thời gian chạy: 1 giây. Bộ nhớ: 256MB.'
    }
  };

  const loadExample = (exampleKey) => {
    const example = presetExamples[exampleKey];
    setProblemData(example);
    form.setFieldsValue(example);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Card>
        <Title level={2}>🧪 AI Validation Demo</Title>
        <Text>
          Demo này cho phép bạn test cơ chế validation của AI Test Case Generation.
          Thay đổi thông tin bài toán để xem validation hoạt động như thế nào.
        </Text>
      </Card>

      {/* Control Panel */}
      <Card title="🎛️ Control Panel" size="small">
        <Space wrap>
          <Button onClick={() => loadExample('empty')}>
            📝 Thông tin trống
          </Button>
          <Button onClick={() => loadExample('incomplete')}>
            ⚠️ Thông tin chưa đầy đủ
          </Button>
          <Button onClick={() => loadExample('complete')} type="primary">
            ✅ Thông tin đầy đủ
          </Button>
        </Space>
      </Card>

      {/* Problem Information Form */}
      <Card title="📋 Thông tin bài toán">
        <Form form={form} layout="vertical" onValuesChange={(_, values) => setProblemData(values)}>
          <Form.Item name="title" label="Tiêu đề bài toán">
            <Input 
              placeholder="Nhập tiêu đề bài toán (ít nhất 5 ký tự)"
              value={problemData.title}
              onChange={(e) => setProblemData({...problemData, title: e.target.value})}
            />
          </Form.Item>
          
          <Form.Item name="description" label="Mô tả bài toán">
            <TextArea 
              rows={4}
              placeholder="Nhập mô tả chi tiết bài toán (ít nhất 20 ký tự)"
              value={problemData.description}
              onChange={(e) => setProblemData({...problemData, description: e.target.value})}
            />
          </Form.Item>
          
          <Form.Item name="constraints" label="Ràng buộc và giới hạn">
            <TextArea 
              rows={2}
              placeholder="Nhập các ràng buộc và giới hạn"
              value={problemData.constraints}
              onChange={(e) => setProblemData({...problemData, constraints: e.target.value})}
            />
          </Form.Item>
        </Form>

        {/* Current Status */}
        <Card size="small" className="mt-4 bg-gray-50">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tiêu đề:</span>
              <span className={problemData.title?.length >= 5 ? 'text-green-600' : 'text-red-600'}>
                {problemData.title?.length || 0} ký tự {problemData.title?.length >= 5 ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Mô tả:</span>
              <span className={problemData.description?.length >= 20 ? 'text-green-600' : 'text-red-600'}>
                {problemData.description?.length || 0} ký tự {problemData.description?.length >= 20 ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ràng buộc:</span>
              <span className={problemData.constraints?.length > 0 ? 'text-green-600' : 'text-red-600'}>
                {problemData.constraints?.length || 0} ký tự {problemData.constraints?.length > 0 ? '✅' : '❌'}
              </span>
            </div>
          </div>
        </Card>
      </Card>

      {/* AI Test Case Generation */}
      <Card title="🤖 AI Test Case Generation với Validation">
        <AITestCaseGenerationTab
          problemTitle={problemData.title}
          problemDescription={problemData.description}
          constraints={problemData.constraints}
          onTestCasesGenerated={handleTestCasesGenerated}
          disabled={false}
        />
      </Card>

      {/* Instructions */}
      <Card title="📖 Hướng dẫn test" size="small">
        <div className="space-y-2 text-sm">
          <p><strong>1. Test validation:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Nhấn "Thông tin trống" → Button AI sẽ bị disable và hiển thị warning</li>
            <li>Nhấn "Thông tin chưa đầy đủ" → Một số field hợp lệ, một số chưa</li>
            <li>Nhấn "Thông tin đầy đủ" → Button AI sẽ enable và hiển thị success</li>
          </ul>
          
          <p><strong>2. Test manual input:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Thay đổi nội dung trong form để xem validation real-time</li>
            <li>Quan sát màu sắc indicators và trạng thái button</li>
            <li>Thử nhấn button khi validation chưa pass</li>
          </ul>

          <p><strong>3. Test AI generation:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Khi validation pass, nhấn "Tạo Test Cases bằng AI"</li>
            <li>Xem console logs để debug quá trình</li>
            <li>Kiểm tra preview và edit test cases</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default AIValidationDemo;
