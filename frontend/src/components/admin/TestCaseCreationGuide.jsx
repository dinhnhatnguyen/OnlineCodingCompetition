import { useState } from "react";
import { Card, Collapse, Alert, Tag, Button, Modal } from "antd";
import {
  QuestionCircleOutlined,
  RocketOutlined,
  EditOutlined,
  FileTextOutlined,
  UploadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

const { Panel } = Collapse;

const TestCaseCreationGuide = ({ visible, onClose }) => {
  const [activeKey, setActiveKey] = useState(["1"]);

  const guideData = [
    {
      key: "1",
      title: "🚀 Tạo nhanh với Templates",
      icon: <RocketOutlined />,
      content: (
        <div className="space-y-4">
          <Alert
            message="Templates thông minh - Tạo test cases chuyên nghiệp"
            type="success"
            showIcon
          />
          
          <div className="space-y-3">
            <h4 className="font-semibold">Tính năng tự động:</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li>Tạo cấu trúc JSON hoàn chỉnh với đúng kiểu dữ liệu</li>
              <li>Thiết lập thuộc tính mặc định (timeLimit: 1000ms, memoryLimit: 262144KB)</li>
              <li>Đánh dấu 2 test case đầu là ví dụ, còn lại là ẩn</li>
              <li>Tạo mô tả test case có ý nghĩa</li>
            </ul>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">📋 Templates có sẵn:</h5>
              <div className="grid grid-cols-2 gap-2">
                <Tag color="blue">Two Sum</Tag>
                <Tag color="green">Array Processing</Tag>
                <Tag color="orange">String Manipulation</Tag>
                <Tag color="purple">Fibonacci</Tag>
                <Tag color="red">Prime Check</Tag>
                <Tag color="cyan">Two Pointers</Tag>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "2", 
      title: "📝 Nhập hàng loạt thông minh",
      icon: <FileTextOutlined />,
      content: (
        <div className="space-y-4">
          <Alert
            message="Hệ thống phát hiện kiểu dữ liệu tự động"
            type="info"
            showIcon
          />

          <div className="space-y-3">
            <h4 className="font-semibold">Định dạng nhập:</h4>
            <pre className="bg-gray-100 p-3 rounded text-sm">
{`INPUT: hello | OUTPUT: olleh | DESC: Test với chuỗi đơn giản
INPUT: | OUTPUT: | DESC: Test với chuỗi rỗng
INPUT: 12345 | OUTPUT: 54321 | DESC: Test với chuỗi số
INPUT: [1,2,3] | OUTPUT: [3,2,1] | DESC: Test với mảng
INPUT: true | OUTPUT: false | DESC: Test với boolean`}
            </pre>

            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">🎯 Phát hiện kiểu dữ liệu:</h5>
              <div className="space-y-1 text-sm">
                <div><code>"hello"</code> → <Tag color="blue">string</Tag></div>
                <div><code>123</code> → <Tag color="green">int</Tag></div>
                <div><code>12.5</code> → <Tag color="orange">double</Tag></div>
                <div><code>true/false</code> → <Tag color="purple">boolean</Tag></div>
                <div><code>[1,2,3]</code> → <Tag color="red">array</Tag></div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "3",
      title: "📊 Import CSV thông minh", 
      icon: <UploadOutlined />,
      content: (
        <div className="space-y-4">
          <Alert
            message="Xử lý CSV với phát hiện kiểu dữ liệu tự động"
            type="warning"
            showIcon
          />

          <div className="space-y-3">
            <h4 className="font-semibold">Định dạng CSV:</h4>
            <div className="bg-gray-100 p-3 rounded">
              <div className="text-sm font-semibold mb-2">Input,Output,Description</div>
              <pre className="text-sm">
{`"hello","olleh","Test với chuỗi đơn giản"
"","","Test với chuỗi rỗng"
"12345","54321","Test với chuỗi số"
"[1,2,3]","[3,2,1]","Test với mảng"
"true","false","Test với boolean"
"3.14","41.3","Test với số thực"`}
              </pre>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">💡 Lưu ý quan trọng:</h5>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Sử dụng dấu ngoặc kép cho giá trị có chứa dấu phẩy</li>
                <li>Hệ thống tự động xử lý ký tự đặc biệt</li>
                <li>2 test case đầu sẽ là ví dụ, còn lại là ẩn</li>
                <li>Tự động thiết lập timeLimit, memoryLimit, comparisonMode</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "4",
      title: "✏️ Chỉnh sửa thủ công",
      icon: <EditOutlined />,
      content: (
        <div className="space-y-4">
          <Alert
            message="Validation thời gian thực và auto-fix thông minh"
            type="success"
            showIcon
          />

          <div className="space-y-3">
            <h4 className="font-semibold">Tính năng nâng cao:</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Validation thời gian thực:</strong> Kiểm tra lỗi ngay khi nhập</li>
              <li><strong>Auto-fix JSON:</strong> Tự động sửa lỗi định dạng JSON</li>
              <li><strong>Smart suggestions:</strong> Gợi ý cải thiện test cases</li>
              <li><strong>Complete structure:</strong> Form đầy đủ tất cả thuộc tính</li>
            </ul>

            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">📋 Thuộc tính đầy đủ:</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>• inputData (JSON)</div>
                <div>• inputType</div>
                <div>• outputType</div>
                <div>• expectedOutputData (JSON)</div>
                <div>• description</div>
                <div>• isExample</div>
                <div>• isHidden</div>
                <div>• timeLimit</div>
                <div>• memoryLimit</div>
                <div>• weight</div>
                <div>• testOrder</div>
                <div>• comparisonMode</div>
                <div>• epsilon (cho số thực)</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "5",
      title: "🔄 Quy trình làm việc",
      icon: <CheckCircleOutlined />,
      content: (
        <div className="space-y-4">
          <Alert
            message="Quy trình tạo test cases hiệu quả"
            type="info"
            showIcon
          />

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-semibold mb-3">📋 Quy trình đề xuất:</h5>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <div className="font-semibold">Chọn phương pháp tạo</div>
                    <div className="text-sm text-gray-600">Templates → Bulk Input → CSV → Manual</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <div className="font-semibold">Tạo test cases cơ bản</div>
                    <div className="text-sm text-gray-600">Hệ thống tự động tạo cấu trúc hoàn chỉnh</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <div className="font-semibold">Chỉnh sửa thủ công</div>
                    <div className="text-sm text-gray-600">Fine-tune trong tab "Chỉnh sửa thủ công"</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <div className="font-semibold">Validation và submit</div>
                    <div className="text-sm text-gray-600">Kiểm tra validation và tạo bài toán</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-semibold mb-2">✅ Kết quả cuối cùng:</h5>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Test cases có cấu trúc JSON hoàn chỉnh</li>
                <li>Đúng định dạng API yêu cầu</li>
                <li>Validation đầy đủ và chính xác</li>
                <li>Sẵn sàng submit tới backend</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title="📚 Hướng dẫn tạo Test Cases - Hệ thống thông minh"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Đã hiểu
        </Button>
      ]}
      width={800}
      style={{ top: 20 }}
    >
      <div className="space-y-4">
        <Alert
          message="🎯 Hệ thống tạo test cases đã được nâng cấp"
          description="Tự động phát hiện kiểu dữ liệu, tạo cấu trúc JSON hoàn chỉnh, và đồng bộ giữa các tab"
          type="success"
          showIcon
        />

        <Collapse
          activeKey={activeKey}
          onChange={setActiveKey}
          size="large"
        >
          {guideData.map((item) => (
            <Panel
              header={
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span className="font-semibold">{item.title}</span>
                </div>
              }
              key={item.key}
            >
              {item.content}
            </Panel>
          ))}
        </Collapse>
      </div>
    </Modal>
  );
};

export default TestCaseCreationGuide;
