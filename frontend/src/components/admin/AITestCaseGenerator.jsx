import React, { useState } from 'react';
import {
  Card,
  Button,
  Form,
  InputNumber,
  Alert,
  Spin,
  Table,
  Space,
  Tag,
  Modal,
  Input,
  Tooltip,
  message,
  Divider,
  Row,
  Col,
  Progress
} from 'antd';
import {
  RobotOutlined,
  ThunderboltOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  BulbOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

const { TextArea } = Input;

const AITestCaseGenerator = ({ 
  problemTitle, 
  problemDescription, 
  constraints,
  onTestCasesGenerated,
  disabled = false 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedTestCases, setGeneratedTestCases] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm] = Form.useForm();

  // AI Service Call
  const generateTestCases = async (values) => {
    try {
      setLoading(true);
      
      const requestData = {
        title: problemTitle || 'Bài toán lập trình',
        description: problemDescription || 'Mô tả bài toán',
        constraints: constraints || '',
        K: values.numberOfTestCases || 5,
        format: 'system' // Request system-compatible format
      };

      console.log('Calling AI service with:', requestData);

      const response = await fetch('http://localhost:3000/CreateTestCaseAutomation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`AI Service Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('AI Service Response:', result);

      if (result.success && result.testCases) {
        setGeneratedTestCases(result.testCases);
        setShowPreview(true);
        message.success(`🎉 Đã sinh thành công ${result.testCases.length} test cases!`);
      } else {
        throw new Error(result.error || 'Unknown AI service error');
      }

    } catch (error) {
      console.error('Error generating test cases:', error);
      
      // Fallback với sample data để demo
      const fallbackTestCases = generateFallbackTestCases(values.numberOfTestCases || 5);
      setGeneratedTestCases(fallbackTestCases);
      setShowPreview(true);
      
      message.warning({
        content: `⚠️ AI service không khả dụng. Đã tạo ${fallbackTestCases.length} test cases mẫu để demo.`,
        duration: 5
      });
    } finally {
      setLoading(false);
    }
  };

  // Fallback test cases for demo
  const generateFallbackTestCases = (count) => {
    const templates = [
      {
        inputData: '[{"input":"3","dataType":"int"},{"input":"5","dataType":"int"}]',
        expectedOutputData: '{"expectedOutput":"8","dataType":"int"}',
        description: 'Test case cơ bản với hai số nguyên dương',
        isExample: true,
        isHidden: false
      },
      {
        inputData: '[{"input":"0","dataType":"int"},{"input":"0","dataType":"int"}]',
        expectedOutputData: '{"expectedOutput":"0","dataType":"int"}',
        description: 'Test case với cả hai số bằng 0',
        isExample: true,
        isHidden: false
      },
      {
        inputData: '[{"input":"-5","dataType":"int"},{"input":"3","dataType":"int"}]',
        expectedOutputData: '{"expectedOutput":"-2","dataType":"int"}',
        description: 'Test case với một số âm và một số dương',
        isExample: false,
        isHidden: true
      },
      {
        inputData: '[{"input":"1000000000","dataType":"int"},{"input":"1000000000","dataType":"int"}]',
        expectedOutputData: '{"expectedOutput":"2000000000","dataType":"int"}',
        description: 'Test case boundary với hai số lớn nhất',
        isExample: false,
        isHidden: true
      },
      {
        inputData: '[{"input":"-1000000000","dataType":"int"},{"input":"-1000000000","dataType":"int"}]',
        expectedOutputData: '{"expectedOutput":"-2000000000","dataType":"int"}',
        description: 'Test case boundary với hai số nhỏ nhất',
        isExample: false,
        isHidden: true
      }
    ];

    return templates.slice(0, count).map((template, index) => ({
      ...template,
      key: index,
      testOrder: index + 1,
      timeLimit: 5000,
      memoryLimit: 262144,
      weight: 1.0,
      comparisonMode: 'EXACT',
      inputType: 'int',
      outputType: 'int'
    }));
  };

  // Table columns for preview
  const columns = [
    {
      title: '#',
      dataIndex: 'testOrder',
      key: 'testOrder',
      width: 50,
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span>{text}</span>
        </Tooltip>
      )
    },
    {
      title: 'Input',
      dataIndex: 'inputData',
      key: 'inputData',
      width: 200,
      render: (text) => {
        try {
          const parsed = JSON.parse(text);
          const values = parsed.map(item => item.input).join(', ');
          return <code className="bg-gray-100 px-2 py-1 rounded">{values}</code>;
        } catch {
          return <code className="bg-gray-100 px-2 py-1 rounded">{text}</code>;
        }
      }
    },
    {
      title: 'Expected Output',
      dataIndex: 'expectedOutputData',
      key: 'expectedOutputData',
      width: 150,
      render: (text) => {
        try {
          const parsed = JSON.parse(text);
          return <code className="bg-green-100 px-2 py-1 rounded">{parsed.expectedOutput}</code>;
        } catch {
          return <code className="bg-green-100 px-2 py-1 rounded">{text}</code>;
        }
      }
    },
    {
      title: 'Loại',
      key: 'type',
      width: 120,
      render: (_, record) => (
        <Space direction="vertical" size="small">
          {record.isExample && <Tag color="green">Ví dụ</Tag>}
          {record.isHidden && <Tag color="orange">Ẩn</Tag>}
        </Space>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      render: (_, record, index) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(index)}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(index)}
          />
        </Space>
      )
    }
  ];

  const handleEdit = (index) => {
    const testCase = generatedTestCases[index];
    setEditingIndex(index);
    
    try {
      const inputData = JSON.parse(testCase.inputData);
      const outputData = JSON.parse(testCase.expectedOutputData);
      
      editForm.setFieldsValue({
        description: testCase.description,
        input: inputData.map(item => item.input).join(', '),
        expectedOutput: outputData.expectedOutput,
        isExample: testCase.isExample,
        isHidden: testCase.isHidden
      });
    } catch (error) {
      console.error('Error parsing test case data:', error);
    }
  };

  const handleDelete = (index) => {
    const newTestCases = generatedTestCases.filter((_, i) => i !== index);
    setGeneratedTestCases(newTestCases);
    message.success('Đã xóa test case');
  };

  const handleSaveEdit = () => {
    editForm.validateFields().then(values => {
      const updatedTestCases = [...generatedTestCases];
      const inputValues = values.input.split(',').map(v => v.trim());
      
      updatedTestCases[editingIndex] = {
        ...updatedTestCases[editingIndex],
        description: values.description,
        inputData: JSON.stringify(inputValues.map(v => ({ input: v, dataType: 'int' }))),
        expectedOutputData: JSON.stringify({ expectedOutput: values.expectedOutput, dataType: 'int' }),
        isExample: values.isExample,
        isHidden: values.isHidden
      };
      
      setGeneratedTestCases(updatedTestCases);
      setEditingIndex(null);
      message.success('Đã cập nhật test case');
    });
  };

  const handleApplyTestCases = () => {
    if (generatedTestCases.length === 0) {
      message.warning('Không có test cases nào để áp dụng');
      return;
    }

    onTestCasesGenerated(generatedTestCases);
    setShowPreview(false);
    message.success(`Đã áp dụng ${generatedTestCases.length} test cases vào form!`);
  };

  return (
    <Card 
      title={
        <Space>
          <RobotOutlined style={{ color: '#1890ff' }} />
          <span>🤖 AI Test Case Generator</span>
          <Tag color="blue">Beta</Tag>
        </Space>
      }
      className="mb-4"
    >
      <Alert
        message="✨ Tính năng AI sinh test case tự động"
        description="Sử dụng AI để tạo test cases đa dạng và chất lượng cao dựa trên mô tả bài toán. AI sẽ tự động tạo các test cases cơ bản, boundary cases và edge cases."
        type="info"
        showIcon
        icon={<BulbOutlined />}
        className="mb-4"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={generateTestCases}
        initialValues={{ numberOfTestCases: 5 }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="numberOfTestCases"
              label={
                <Space>
                  <span>Số lượng test cases</span>
                  <Tooltip title="Khuyến nghị: 5-10 test cases cho bài toán thông thường">
                    <InfoCircleOutlined />
                  </Tooltip>
                </Space>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập số lượng test cases' },
                { type: 'number', min: 1, max: 20, message: 'Số lượng phải từ 1-20' }
              ]}
            >
              <InputNumber
                min={1}
                max={20}
                style={{ width: '100%' }}
                placeholder="Nhập số lượng (1-20)"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label=" ">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={disabled || !problemTitle || !problemDescription}
                icon={<ThunderboltOutlined />}
                size="large"
                block
              >
                {loading ? 'Đang sinh test cases...' : '🚀 Sinh Test Cases'}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {loading && (
        <div className="text-center py-8">
          <Spin size="large" />
          <div className="mt-4">
            <Progress percent={Math.random() * 100} status="active" />
            <p className="text-gray-600 mt-2">AI đang phân tích bài toán và sinh test cases...</p>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        title={
          <Space>
            <ExperimentOutlined />
            <span>Preview & Edit Test Cases</span>
            <Tag color="green">{generatedTestCases.length} test cases</Tag>
          </Space>
        }
        open={showPreview}
        onCancel={() => setShowPreview(false)}
        width={1200}
        footer={[
          <Button key="cancel" onClick={() => setShowPreview(false)}>
            Hủy
          </Button>,
          <Button
            key="apply"
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleApplyTestCases}
            disabled={generatedTestCases.length === 0}
          >
            Áp dụng {generatedTestCases.length} Test Cases
          </Button>
        ]}
      >
        <Alert
          message="🎯 Review và chỉnh sửa test cases"
          description="Kiểm tra và chỉnh sửa các test cases được AI sinh ra trước khi áp dụng vào bài toán."
          type="success"
          showIcon
          className="mb-4"
        />

        <Table
          columns={columns}
          dataSource={generatedTestCases}
          rowKey="key"
          pagination={false}
          size="small"
          scroll={{ y: 400 }}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa Test Case"
        open={editingIndex !== null}
        onCancel={() => setEditingIndex(null)}
        onOk={handleSaveEdit}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input placeholder="Mô tả test case" />
          </Form.Item>
          
          <Form.Item
            name="input"
            label="Input (phân cách bằng dấu phẩy)"
            rules={[{ required: true, message: 'Vui lòng nhập input' }]}
          >
            <Input placeholder="Ví dụ: 3, 5" />
          </Form.Item>
          
          <Form.Item
            name="expectedOutput"
            label="Expected Output"
            rules={[{ required: true, message: 'Vui lòng nhập expected output' }]}
          >
            <Input placeholder="Ví dụ: 8" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AITestCaseGenerator;
