import React, { useState } from "react";
import {
  Card,
  Steps,
  Button,
  Alert,
  Space,
  Collapse,
  Tag,
  Typography,
  Divider,
} from "antd";
import {
  RocketOutlined,
  CheckCircleOutlined,
  BulbOutlined,
  BarChartOutlined,
  PlayCircleOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Step } = Steps;
const { Panel } = Collapse;
const { Title, Paragraph, Text } = Typography;

const QuickStartGuide = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Chọn phương pháp tạo",
      description: "Chọn cách tạo test cases phù hợp",
      content: (
        <div className="space-y-4">
          <Alert
            message="🎯 Chọn phương pháp phù hợp với nhu cầu"
            type="info"
            showIcon
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-blue-200">
              <div className="text-center">
                <RocketOutlined className="text-2xl text-blue-600 mb-2" />
                <h4 className="font-semibold">Quick Generate</h4>
                <p className="text-sm text-gray-600">
                  Sử dụng templates có sẵn hoặc bulk input
                </p>
                <Tag color="blue">Nhanh nhất</Tag>
              </div>
            </Card>
            
            <Card className="border-green-200">
              <div className="text-center">
                <BulbOutlined className="text-2xl text-green-600 mb-2" />
                <h4 className="font-semibold">Advanced Templates</h4>
                <p className="text-sm text-gray-600">
                  Templates thuật toán chuyên nghiệp
                </p>
                <Tag color="green">Chất lượng cao</Tag>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      title: "Tạo test cases",
      description: "Sử dụng công cụ để tạo test cases",
      content: (
        <div className="space-y-4">
          <Alert
            message="⚡ Các cách tạo test cases nhanh"
            type="success"
            showIcon
          />
          
          <Collapse>
            <Panel header="📋 Templates" key="1">
              <div className="space-y-2">
                <p><strong>Array Processing:</strong> Cho bài toán xử lý mảng</p>
                <p><strong>String Manipulation:</strong> Cho bài toán xử lý chuỗi</p>
                <p><strong>Two Pointers:</strong> Cho thuật toán hai con trỏ</p>
                <Text code>Chọn template → Click "Apply" → Có ngay 5 test cases!</Text>
              </div>
            </Panel>
            
            <Panel header="📝 Bulk Input" key="2">
              <div className="space-y-2">
                <p>Format đơn giản:</p>
                <pre className="bg-gray-100 p-2 rounded text-sm">
{`INPUT: [1,2,3] | OUTPUT: 6 | DESC: Small array
INPUT: [5,10,15] | OUTPUT: 30 | DESC: Medium array
INPUT: [] | OUTPUT: 0 | DESC: Empty array`}
                </pre>
                <Text code>Paste text → Click "Generate" → Tự động tạo test cases!</Text>
              </div>
            </Panel>
            
            <Panel header="📊 CSV Import" key="3">
              <div className="space-y-2">
                <p>Upload file CSV với format:</p>
                <pre className="bg-gray-100 p-2 rounded text-sm">
{`"[1,2,3]","6","Small array"
"[5,10,15]","30","Medium array"
"[]","0","Empty array"`}
                </pre>
                <Text code>Upload file → Auto import → Hoàn thành!</Text>
              </div>
            </Panel>
          </Collapse>
        </div>
      ),
    },
    {
      title: "Kiểm tra chất lượng",
      description: "Sử dụng Analytics để đánh giá",
      content: (
        <div className="space-y-4">
          <Alert
            message="📊 Analytics giúp đảm bảo chất lượng test cases"
            type="warning"
            showIcon
          />
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircleOutlined className="text-green-600" />
              <span><strong>Quality Score:</strong> Điểm chất lượng 0-100</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <BarChartOutlined className="text-blue-600" />
              <span><strong>Coverage Analysis:</strong> Phân tích độ bao phủ</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <BulbOutlined className="text-orange-600" />
              <span><strong>Recommendations:</strong> Gợi ý cải thiện</span>
            </div>
          </div>
          
          <Alert
            message="💡 Mục tiêu: Quality Score ≥ 80 điểm"
            description="Bao gồm: Example cases, Edge cases, Hidden tests, Good descriptions"
            type="info"
            showIcon
          />
        </div>
      ),
    },
    {
      title: "Hoàn thành",
      description: "Lưu và sử dụng test cases",
      content: (
        <div className="space-y-4">
          <Alert
            message="🎉 Chúc mừng! Bạn đã tạo test cases chất lượng cao"
            type="success"
            showIcon
          />
          
          <div className="bg-green-50 p-4 rounded">
            <h4 className="font-semibold text-green-800 mb-2">Kết quả đạt được:</h4>
            <ul className="space-y-1 text-green-700">
              <li>✅ Test cases được tạo nhanh chóng (90% tiết kiệm thời gian)</li>
              <li>✅ Chất lượng chuyên nghiệp với validation tự động</li>
              <li>✅ Bao gồm edge cases và stress tests</li>
              <li>✅ Analytics và recommendations chi tiết</li>
            </ul>
          </div>
          
          <div className="text-center">
            <Button type="primary" size="large" onClick={onClose}>
              🚀 Bắt đầu tạo test cases!
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Card title="🚀 Hướng dẫn nhanh: Test Case Manager" className="max-w-4xl">
      <div className="mb-6">
        <Steps current={currentStep} size="small">
          {steps.map((step, index) => (
            <Step
              key={index}
              title={step.title}
              description={step.description}
            />
          ))}
        </Steps>
      </div>

      <div className="min-h-[300px] mb-6">
        {steps[currentStep].content}
      </div>

      <Divider />

      <div className="flex justify-between items-center">
        <div>
          {currentStep > 0 && (
            <Button onClick={() => setCurrentStep(currentStep - 1)}>
              ← Quay lại
            </Button>
          )}
        </div>
        
        <div className="text-center">
          <Text type="secondary">
            Bước {currentStep + 1} / {steps.length}
          </Text>
        </div>
        
        <div>
          {currentStep < steps.length - 1 ? (
            <Button 
              type="primary" 
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Tiếp theo →
            </Button>
          ) : (
            <Button type="primary" onClick={onClose}>
              Hoàn thành
            </Button>
          )}
        </div>
      </div>

      <Divider />

      <div className="text-center">
        <Space>
          <Button 
            icon={<PlayCircleOutlined />}
            onClick={onClose}
          >
            Bỏ qua hướng dẫn
          </Button>
          
          <Button 
            icon={<BookOutlined />}
            href="/admin/problems/testcase-demo"
            target="_blank"
          >
            Xem Demo
          </Button>
        </Space>
      </div>
    </Card>
  );
};

export default QuickStartGuide;
