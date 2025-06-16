import { useState } from "react";
import { Card, Button, Input, Alert, Tabs, message, Upload } from "antd";
import { UploadOutlined, RocketOutlined } from "@ant-design/icons";

const { TextArea } = Input;
const { TabPane } = Tabs;

// Quick Templates cho các pattern phổ biến - Phiên bản Việt Nam
const QUICK_TEMPLATES = {
  two_sum: {
    name: "Two Sum (Tìm hai số)",
    description: "Template cho bài toán tìm hai số có tổng bằng target",
    inputs: [
      { type: "int[]", value: "[2,7,11,15]" },
      { type: "int", value: "9" },
    ],
    output: { type: "int[]", value: "[0,1]" },
    testCases: [
      {
        inputs: [
          { type: "int[]", value: "[2,7,11,15]" },
          { type: "int", value: "9" },
        ],
        output: { type: "int[]", value: "[0,1]" },
        description: "Ví dụ cơ bản: hai số đầu tiên",
      },
      {
        inputs: [
          { type: "int[]", value: "[3,2,4]" },
          { type: "int", value: "6" },
        ],
        output: { type: "int[]", value: "[1,2]" },
        description: "Ví dụ: phần tử ở giữa và cuối",
      },
      {
        inputs: [
          { type: "int[]", value: "[3,3]" },
          { type: "int", value: "6" },
        ],
        output: { type: "int[]", value: "[0,1]" },
        description: "Edge case: hai số giống nhau",
      },
    ],
  },
  array_processing: {
    name: "Xử lý mảng",
    description: "Template cho bài toán xử lý mảng số nguyên",
    inputs: [{ type: "int[]", value: "[1,2,3,4,5]" }],
    output: { type: "int", value: "15" },
    testCases: [
      {
        inputs: [{ type: "int[]", value: "[1,2,3]" }],
        output: { type: "int", value: "6" },
        description: "Mảng nhỏ",
      },
      {
        inputs: [{ type: "int[]", value: "[5,10,15,20]" }],
        output: { type: "int", value: "50" },
        description: "Mảng trung bình",
      },
      {
        inputs: [{ type: "int[]", value: "[]" }],
        output: { type: "int", value: "0" },
        description: "Mảng rỗng",
      },
    ],
  },
  string_manipulation: {
    name: "Xử lý chuỗi",
    description: "Template cho bài toán xử lý chuỗi",
    inputs: [{ type: "String", value: '"hello world"' }],
    output: { type: "String", value: '"Hello World"' },
    testCases: [
      {
        inputs: [{ type: "String", value: '"hello"' }],
        output: { type: "String", value: '"Hello"' },
        description: "Chuỗi đơn giản",
      },
      {
        inputs: [{ type: "String", value: '""' }],
        output: { type: "String", value: '""' },
        description: "Chuỗi rỗng",
      },
    ],
  },
  fibonacci: {
    name: "Dãy Fibonacci",
    description:
      "Template cho bài toán dãy Fibonacci - phổ biến trong giáo dục Việt Nam",
    inputs: [{ type: "int", value: "10" }],
    output: { type: "int", value: "55" },
    testCases: [
      {
        inputs: [{ type: "int", value: "0" }],
        output: { type: "int", value: "0" },
        description: "Trường hợp cơ sở: F(0) = 0",
      },
      {
        inputs: [{ type: "int", value: "1" }],
        output: { type: "int", value: "1" },
        description: "Trường hợp cơ sở: F(1) = 1",
      },
      {
        inputs: [{ type: "int", value: "10" }],
        output: { type: "int", value: "55" },
        description: "Trường hợp thông thường: F(10) = 55",
      },
    ],
  },
  prime_check: {
    name: "Kiểm tra số nguyên tố",
    description: "Template cho bài toán kiểm tra số nguyên tố",
    inputs: [{ type: "int", value: "17" }],
    output: { type: "boolean", value: "true" },
    testCases: [
      {
        inputs: [{ type: "int", value: "2" }],
        output: { type: "boolean", value: "true" },
        description: "Số nguyên tố nhỏ nhất",
      },
      {
        inputs: [{ type: "int", value: "4" }],
        output: { type: "boolean", value: "false" },
        description: "Số chẵn không phải số nguyên tố",
      },
      {
        inputs: [{ type: "int", value: "17" }],
        output: { type: "boolean", value: "true" },
        description: "Số nguyên tố lớn hơn",
      },
    ],
  },
  gcd_lcm: {
    name: "Ước chung lớn nhất (GCD)",
    description: "Template cho bài toán tìm ước chung lớn nhất",
    inputs: [
      { type: "int", value: "48" },
      { type: "int", value: "18" },
    ],
    output: { type: "int", value: "6" },
    testCases: [
      {
        inputs: [
          { type: "int", value: "48" },
          { type: "int", value: "18" },
        ],
        output: { type: "int", value: "6" },
        description: "Ví dụ cơ bản: GCD(48, 18) = 6",
      },
      {
        inputs: [
          { type: "int", value: "7" },
          { type: "int", value: "3" },
        ],
        output: { type: "int", value: "1" },
        description: "Hai số nguyên tố cùng nhau",
      },
      {
        inputs: [
          { type: "int", value: "100" },
          { type: "int", value: "25" },
        ],
        output: { type: "int", value: "25" },
        description: "Một số chia hết cho số kia",
      },
    ],
  },
  two_pointers: {
    name: "Two Pointers",
    description: "Template cho thuật toán two pointers",
    inputs: [
      { type: "int[]", value: "[1,2,3,4,5]" },
      { type: "int", value: "7" },
    ],
    output: { type: "int[]", value: "[2,3]" },
    testCases: [
      {
        inputs: [
          { type: "int[]", value: "[1,2,3,4]" },
          { type: "int", value: "5" },
        ],
        output: { type: "int[]", value: "[1,2]" },
        description: "Tìm thấy cặp",
      },
      {
        inputs: [
          { type: "int[]", value: "[1,2,3]" },
          { type: "int", value: "10" },
        ],
        output: { type: "int[]", value: "[]" },
        description: "Không tìm thấy",
      },
    ],
  },
};

const TestCaseQuickInput = ({ onTestCasesGenerated }) => {
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [bulkInput, setBulkInput] = useState("");

  // Removed AI Generator states - keeping only core functionality

  // Enhanced Smart Template Selection
  const renderTemplateSelector = () => (
    <div className="space-y-4">
      <Alert
        message="🚀 Templates thông minh - Tạo test cases chuyên nghiệp"
        description={
          <div className="space-y-2">
            <p>Chọn template phù hợp với loại bài toán. Hệ thống sẽ tự động:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tạo cấu trúc JSON hoàn chỉnh với đúng kiểu dữ liệu</li>
              <li>
                Thiết lập các thuộc tính mặc định (timeLimit, memoryLimit,
                comparisonMode)
              </li>
              <li>Đánh dấu test cases ví dụ và ẩn phù hợp</li>
              <li>Tạo mô tả test case có ý nghĩa</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(QUICK_TEMPLATES).map(([key, template]) => (
          <Card
            key={key}
            hoverable
            className={`cursor-pointer transition-all ${
              selectedTemplate === key ? "border-blue-500 shadow-lg" : ""
            }`}
            onClick={() => setSelectedTemplate(key)}
          >
            <div className="text-center">
              <RocketOutlined className="text-2xl text-blue-500 mb-2" />
              <h4 className="font-semibold">{template.name}</h4>
              <p className="text-gray-600 text-sm">{template.description}</p>
              <div className="mt-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {template.testCases.length} test cases
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedTemplate && (
        <Card title="🔍 Xem trước Template" className="mt-4 border-blue-200">
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                📋 Thông tin Template
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Tên:</strong> {QUICK_TEMPLATES[selectedTemplate].name}
                </div>
                <div>
                  <strong>Mô tả:</strong>{" "}
                  {QUICK_TEMPLATES[selectedTemplate].description}
                </div>
                <div>
                  <strong>Số test cases:</strong>{" "}
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {QUICK_TEMPLATES[selectedTemplate].testCases.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="font-semibold text-green-800 mb-2">📥 Input</h5>
                <div className="space-y-1 text-sm">
                  {QUICK_TEMPLATES[selectedTemplate].inputs.map(
                    (input, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="font-mono bg-white px-2 py-1 rounded">
                          {input.value}
                        </span>
                        <span className="text-green-600 font-semibold">
                          {input.type}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h5 className="font-semibold text-orange-800 mb-2">
                  📤 Output
                </h5>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="font-mono bg-white px-2 py-1 rounded">
                      {QUICK_TEMPLATES[selectedTemplate].output.value}
                    </span>
                    <span className="text-orange-600 font-semibold">
                      {QUICK_TEMPLATES[selectedTemplate].output.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-2">
                🧪 Test Cases Preview
              </h5>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {QUICK_TEMPLATES[selectedTemplate].testCases.map(
                  (testCase, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-2 rounded border text-sm"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">#{idx + 1}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            idx < 2
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {idx < 2 ? "Ví dụ" : "Ẩn"}
                        </span>
                      </div>
                      <div className="text-gray-600 mt-1">
                        {testCase.description}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                type="primary"
                size="large"
                onClick={() => applyTemplate(selectedTemplate)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 border-none"
              >
                ✨ Áp dụng Template (
                {QUICK_TEMPLATES[selectedTemplate].testCases.length} test cases)
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const applyTemplate = (templateKey) => {
    const template = QUICK_TEMPLATES[templateKey];
    const generatedTestCases = template.testCases.map((testCase, index) => {
      // Determine primary input and output types for the template
      const primaryInputType = testCase.inputs[0]?.type || "string";
      const outputType = testCase.output.type;

      return {
        inputData: JSON.stringify(
          testCase.inputs.map((input) => ({
            input: input.value,
            dataType: input.type,
          }))
        ),
        inputType: primaryInputType,
        outputType: outputType,
        expectedOutputData: JSON.stringify({
          expectedOutput: testCase.output.value,
          dataType: testCase.output.type,
        }),
        description: testCase.description,
        isExample: index < 2, // First 2 are examples by default
        isHidden: index >= 2, // Rest are hidden
        timeLimit: 1000,
        memoryLimit: 262144,
        weight: 1.0,
        testOrder: index + 1,
        comparisonMode: "EXACT",
        epsilon: null,
      };
    });

    onTestCasesGenerated(generatedTestCases);
    message.success(
      `Đã tạo ${generatedTestCases.length} test cases từ template!`
    );
  };

  // Enhanced Bulk Input với hướng dẫn chi tiết
  const renderBulkInput = () => (
    <div className="space-y-4">
      <Alert
        message="📝 Nhập hàng loạt Test Cases - Hệ thống thông minh"
        description={
          <div className="space-y-3">
            <p>
              <strong>Hệ thống sẽ tự động:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Phát hiện kiểu dữ liệu (string, int, double, boolean, array)
              </li>
              <li>Tạo cấu trúc JSON hoàn chỉnh cho input và output</li>
              <li>
                Thiết lập các thuộc tính mặc định (timeLimit, memoryLimit, etc.)
              </li>
              <li>Đánh dấu 2 test case đầu là ví dụ, còn lại là ẩn</li>
            </ul>

            <div>
              <p>
                <strong>Định dạng nhập:</strong>
              </p>
              <pre className="bg-gray-100 p-3 rounded mt-2 text-sm">
                {`INPUT: hello | OUTPUT: olleh | DESC: Test với chuỗi đơn giản
INPUT: | OUTPUT: | DESC: Test với chuỗi rỗng
INPUT: 12345 | OUTPUT: 54321 | DESC: Test với chuỗi số
INPUT: [1,2,3] | OUTPUT: [3,2,1] | DESC: Test với mảng
INPUT: true | OUTPUT: false | DESC: Test với boolean`}
              </pre>
            </div>

            <div className="text-sm text-blue-600">
              <p>
                <strong>💡 Mẹo:</strong> Hệ thống tự động phát hiện:
              </p>
              <ul className="list-disc pl-5">
                <li>
                  <code>"hello"</code> → string
                </li>
                <li>
                  <code>123</code> → int
                </li>
                <li>
                  <code>12.5</code> → double
                </li>
                <li>
                  <code>true/false</code> → boolean
                </li>
                <li>
                  <code>[1,2,3]</code> → array
                </li>
              </ul>
            </div>
          </div>
        }
        type="info"
        showIcon
      />

      <TextArea
        rows={10}
        placeholder={`Nhập test cases theo format trên, ví dụ:
INPUT: hello | OUTPUT: olleh | DESC: Test chuỗi đơn giản
INPUT: world | OUTPUT: dlrow | DESC: Test chuỗi khác
INPUT: 123 | OUTPUT: 321 | DESC: Test chuỗi số`}
        value={bulkInput}
        onChange={(e) => setBulkInput(e.target.value)}
      />

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {
            bulkInput
              .trim()
              .split("\n")
              .filter((line) => line.trim()).length
          }{" "}
          test cases sẽ được tạo
        </div>
        <Button
          type="primary"
          onClick={processBulkInput}
          disabled={!bulkInput.trim()}
          size="large"
        >
          🚀 Tạo Test Cases thông minh
        </Button>
      </div>
    </div>
  );

  // Smart data type detection function
  const detectDataType = (value) => {
    if (value === null || value === undefined || value === "") {
      return "string";
    }

    const strValue = String(value).trim();

    // Check for array format
    if (strValue.startsWith("[") && strValue.endsWith("]")) {
      return "array";
    }

    // Check for boolean
    if (strValue === "true" || strValue === "false") {
      return "boolean";
    }

    // Check for number (integer or float)
    if (!isNaN(strValue) && !isNaN(parseFloat(strValue))) {
      return strValue.includes(".") ? "double" : "int";
    }

    // Default to string
    return "string";
  };

  // Enhanced bulk input processing with complete data structure
  const processBulkInput = () => {
    try {
      const lines = bulkInput
        .trim()
        .split("\n")
        .filter((line) => line.trim());

      const testCases = lines.map((line, index) => {
        const parts = line.split("|").map((part) => part.trim());
        const input = parts[0].replace("INPUT:", "").trim();
        const output = parts[1].replace("OUTPUT:", "").trim();
        const description =
          parts[2]?.replace("DESC:", "").trim() || `Test case ${index + 1}`;

        // Detect data types
        const inputDataType = detectDataType(input);
        const outputDataType = detectDataType(output);

        // Create complete test case structure matching the sample request format
        return {
          inputData: JSON.stringify([{ input, dataType: inputDataType }]),
          inputType: inputDataType,
          outputType: outputDataType,
          expectedOutputData: JSON.stringify({
            expectedOutput: output,
            dataType: outputDataType,
          }),
          description,
          isExample: index < 2, // First 2 are examples by default
          isHidden: index >= 2, // Rest are hidden
          timeLimit: 1000,
          memoryLimit: 262144,
          weight: 1.0,
          testOrder: index + 1,
          comparisonMode: "EXACT",
          epsilon: null,
        };
      });

      onTestCasesGenerated(testCases);
      message.success(
        `Đã tạo ${testCases.length} test cases từ nhập hàng loạt!`
      );
      setBulkInput("");
    } catch (error) {
      console.error("Bulk input processing error:", error);
      message.error("Lỗi định dạng nhập hàng loạt. Vui lòng kiểm tra lại!");
    }
  };

  // AI Generator removed - focusing on core manual and template-based generation

  // Enhanced CSV Import với hướng dẫn chi tiết
  const renderCSVImport = () => (
    <div className="space-y-4">
      <Alert
        message="📊 Import CSV - Hệ thống thông minh"
        description={
          <div className="space-y-3">
            <p>
              <strong>Tính năng thông minh:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Tự động phát hiện kiểu dữ liệu từ nội dung CSV</li>
              <li>Xử lý dấu ngoặc kép và ký tự đặc biệt</li>
              <li>Tạo cấu trúc JSON hoàn chỉnh tự động</li>
              <li>Thiết lập thuộc tính mặc định cho từng test case</li>
            </ul>

            <div className="text-sm text-blue-600">
              <p>
                <strong>📋 Định dạng CSV:</strong> Input,Output,Description
              </p>
              <p>
                <strong>🎯 Ví dụ kiểu dữ liệu được phát hiện:</strong>
              </p>
              <ul className="list-disc pl-5">
                <li>
                  <code>"hello","olleh"</code> → string
                </li>
                <li>
                  <code>123,321</code> → int
                </li>
                <li>
                  <code>12.5,52.1</code> → double
                </li>
                <li>
                  <code>"[1,2,3]","[3,2,1]"</code> → array
                </li>
                <li>
                  <code>true,false</code> → boolean
                </li>
              </ul>
            </div>
          </div>
        }
        type="info"
        showIcon
      />

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        <Upload
          accept=".csv"
          beforeUpload={handleCSVUpload}
          showUploadList={false}
          className="w-full"
        >
          <div className="space-y-2">
            <UploadOutlined className="text-3xl text-gray-400" />
            <div>
              <Button type="primary" size="large">
                📂 Chọn file CSV
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Kéo thả file CSV vào đây hoặc click để chọn
            </p>
          </div>
        </Upload>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">📝 File CSV mẫu:</h4>
        <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
          {`"hello","olleh","Test với chuỗi đơn giản"
"","","Test với chuỗi rỗng"
"12345","54321","Test với chuỗi số"
"[1,2,3]","[3,2,1]","Test với mảng"
"true","false","Test với boolean"
"3.14","41.3","Test với số thực"`}
        </pre>

        <div className="mt-3 text-sm text-gray-600">
          <p>
            <strong>💡 Lưu ý:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Sử dụng dấu ngoặc kép để bao quanh giá trị có chứa dấu phẩy</li>
            <li>Cột 1: Input data, Cột 2: Expected output, Cột 3: Mô tả</li>
            <li>
              Hệ thống tự động tạo 2 test case đầu là ví dụ, còn lại là ẩn
            </li>
            <li>
              Các thuộc tính khác (timeLimit, memoryLimit) sẽ được thiết lập mặc
              định
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Enhanced CSV upload with complete data structure
  const handleCSVUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split("\n").filter((line) => line.trim());

        const testCases = lines.map((line, index) => {
          // Enhanced CSV parsing to handle quoted values properly
          const values = [];
          let current = "";
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              values.push(current.trim());
              current = "";
            } else {
              current += char;
            }
          }
          values.push(current.trim()); // Add the last value

          const input = values[0] || "";
          const output = values[1] || "";
          const description = values[2] || `Test case ${index + 1}`;

          // Detect data types for CSV input
          const inputDataType = detectDataType(input);
          const outputDataType = detectDataType(output);

          // Create complete test case structure matching the sample request format
          return {
            inputData: JSON.stringify([{ input, dataType: inputDataType }]),
            inputType: inputDataType,
            outputType: outputDataType,
            expectedOutputData: JSON.stringify({
              expectedOutput: output,
              dataType: outputDataType,
            }),
            description,
            isExample: index < 2, // First 2 are examples by default
            isHidden: index >= 2, // Rest are hidden
            timeLimit: 1000,
            memoryLimit: 262144,
            weight: 1.0,
            testOrder: index + 1,
            comparisonMode: "EXACT",
            epsilon: null,
          };
        });

        onTestCasesGenerated(testCases);
        message.success(`Đã import ${testCases.length} test cases từ CSV!`);
      } catch (error) {
        console.error("CSV upload error:", error);
        message.error("Lỗi đọc file CSV! Vui lòng kiểm tra định dạng file.");
      }
    };
    reader.readAsText(file);
    return false; // Prevent upload
  };

  return (
    <Card title="⚡ Trình tạo Test Case nhanh" className="mb-6">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="📋 Mẫu có sẵn" key="templates">
          {renderTemplateSelector()}
        </TabPane>

        <TabPane tab="📝 Nhập hàng loạt" key="bulk">
          {renderBulkInput()}
        </TabPane>

        <TabPane tab="📊 Import CSV" key="csv">
          {renderCSVImport()}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default TestCaseQuickInput;
