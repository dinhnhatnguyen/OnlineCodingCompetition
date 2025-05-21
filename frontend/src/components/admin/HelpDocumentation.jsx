import React from "react";
import { Typography, Divider, Card, Table, Alert } from "antd";
import { CodeBlock, atomOneDark } from "react-code-blocks";

const { Title, Paragraph, Text } = Typography;

const HelpDocumentation = () => {
  // Sample code for the examples
  const javaSignatureExample = `{
  "returnType": "int",
  "name": "timKetQuaMax",
  "params": [
    {"name": "mang", "type": "int[]"},
    {"name": "k", "type": "int"}
  ]
}`;

  const pythonSignatureExample = `{
  "returnType": "int",
  "name": "tim_ket_qua_max",
  "params": [
    {"name": "mang", "type": "List[int]"},
    {"name": "k", "type": "int"}
  ]
}`;

  const testCaseInputExample = `[
  {"input": "[3, 1, 4, 1, 5, 9, 2]", "dataType": "int[]"}, 
  {"input": "3", "dataType": "int"}
]`;

  const testCaseOutputExample = `{
  "expectedOutput": "9", 
  "dataType": "int"
}`;

  // Columns for the data types table
  const dataTypeColumns = [
    {
      title: "Kiểu dữ liệu",
      dataIndex: "type",
      key: "type",
      width: "20%",
    },
    {
      title: "Java",
      dataIndex: "java",
      key: "java",
      width: "20%",
    },
    {
      title: "Python",
      dataIndex: "python",
      key: "python",
      width: "20%",
    },
    {
      title: "JavaScript",
      dataIndex: "javascript",
      key: "javascript",
      width: "20%",
    },
    {
      title: "C++",
      dataIndex: "cpp",
      key: "cpp",
      width: "20%",
    },
  ];

  // Data for the data types table
  const dataTypeData = [
    {
      key: "1",
      type: "Số nguyên",
      java: "int, Integer, long, Long",
      python: "int",
      javascript: "number",
      cpp: "int, long, int64_t",
    },
    {
      key: "2",
      type: "Số thực",
      java: "float, double, Float, Double",
      python: "float",
      javascript: "number",
      cpp: "float, double",
    },
    {
      key: "3",
      type: "Chuỗi",
      java: "String",
      python: "str",
      javascript: "string",
      cpp: "string, char*, const char*",
    },
    {
      key: "4",
      type: "Boolean",
      java: "boolean, Boolean",
      python: "bool",
      javascript: "boolean",
      cpp: "bool",
    },
    {
      key: "5",
      type: "Mảng số nguyên",
      java: "int[], Integer[]",
      python: "List[int]",
      javascript: "number[], Array<number>",
      cpp: "vector<int>",
    },
    {
      key: "6",
      type: "Mảng chuỗi",
      java: "String[]",
      python: "List[str]",
      javascript: "string[], Array<string>",
      cpp: "vector<string>",
    },
    {
      key: "7",
      type: "Map/Dictionary",
      java: "Map<K,V>, HashMap<K,V>",
      python: "Dict[K,V], dict",
      javascript: "object, Map",
      cpp: "map<K,V>, unordered_map<K,V>",
    },
  ];

  return (
    <div className="p-6">
      <Title level={2}>Hướng Dẫn Tạo Bài Toán</Title>

      <Alert
        message="Tài liệu tham khảo chi tiết"
        description="Tài liệu này cung cấp thông tin chi tiết về cách tạo bài toán, định nghĩa Function Signature và tạo test cases trong hệ thống của chúng tôi."
        type="info"
        showIcon
        className="mb-6"
      />

      <Divider />

      <Title level={3}>1. Quy trình tạo bài toán</Title>
      <Paragraph>Việc tạo một bài toán mới bao gồm ba bước chính:</Paragraph>
      <ol className="list-decimal pl-8 mb-6">
        <li className="mb-2">
          <Text strong>Thông tin cơ bản:</Text> Định nghĩa tiêu đề, mô tả, độ
          khó và chủ đề của bài toán.
        </li>
        <li className="mb-2">
          <Text strong>Function Signature:</Text> Chọn các ngôn ngữ lập trình hỗ
          trợ và định nghĩa Function Signature cho mỗi ngôn ngữ.
        </li>
        <li className="mb-2">
          <Text strong>Test cases:</Text> Tạo các test cases với dữ liệu đầu
          vào, đầu ra mong đợi và các cài đặt liên quan.
        </li>
      </ol>

      <Divider />

      <Title level={3}>2. Định nghĩa Function Signature</Title>
      <Paragraph>
        Function Signature xác định cách người dùng sẽ triển khai giải pháp của
        họ. Định dạng JSON được sử dụng để xác định kiểu trả về, tên hàm, và các
        tham số.
      </Paragraph>

      <Card title="Ví dụ Function Signature Java" className="mb-4">
        <CodeBlock
          text={javaSignatureExample}
          language="json"
          theme={atomOneDark}
          showLineNumbers
        />
        <Text type="secondary" className="mt-2 block">
          Định nghĩa một hàm Java có tên "timKetQuaMax" nhận vào một mảng số
          nguyên và một số nguyên, trả về một số nguyên.
        </Text>
      </Card>

      <Card title="Ví dụ Function Signature Python" className="mb-4">
        <CodeBlock
          text={pythonSignatureExample}
          language="json"
          theme={atomOneDark}
          showLineNumbers
        />
        <Text type="secondary" className="mt-2 block">
          Định nghĩa tương tự cho Python, lưu ý kiểu dữ liệu khác nhau giữa các
          ngôn ngữ.
        </Text>
      </Card>

      <Divider />

      <Title level={3}>3. Các kiểu dữ liệu hỗ trợ</Title>
      <Paragraph>
        Hệ thống hỗ trợ nhiều kiểu dữ liệu khác nhau trong các ngôn ngữ lập
        trình:
      </Paragraph>

      <Table
        columns={dataTypeColumns}
        dataSource={dataTypeData}
        pagination={false}
        className="mb-6"
        scroll={{ x: true }}
      />

      <Divider />

      <Title level={3}>4. Tạo Test Cases</Title>
      <Paragraph>
        Test cases xác định đầu vào và đầu ra mong đợi để kiểm tra giải pháp của
        người dùng. Mỗi test case phải có định dạng JSON đặc biệt.
      </Paragraph>

      <Title level={4}>Định dạng đầu vào (Input)</Title>
      <Paragraph>
        Đầu vào là một mảng JSON chứa các tham số. Mỗi tham số có hai thuộc
        tính: <Text code>input</Text> (giá trị) và <Text code>dataType</Text>{" "}
        (kiểu dữ liệu).
      </Paragraph>

      <Card title="Ví dụ định dạng đầu vào" className="mb-4">
        <CodeBlock
          text={testCaseInputExample}
          language="json"
          theme={atomOneDark}
          showLineNumbers
        />
        <Text type="secondary" className="mt-2 block">
          Đây là một test case với hai tham số: một mảng số nguyên
          [3,1,4,1,5,9,2] và một số nguyên 3.
        </Text>
      </Card>

      <Title level={4}>Định dạng đầu ra (Output)</Title>
      <Paragraph>
        Đầu ra được định nghĩa bằng một đối tượng JSON với hai thuộc tính:{" "}
        <Text code>expectedOutput</Text> (kết quả mong đợi) và{" "}
        <Text code>dataType</Text> (kiểu dữ liệu).
      </Paragraph>

      <Card title="Ví dụ định dạng đầu ra" className="mb-4">
        <CodeBlock
          text={testCaseOutputExample}
          language="json"
          theme={atomOneDark}
          showLineNumbers
        />
        <Text type="secondary" className="mt-2 block">
          Đây là kết quả mong đợi là số nguyên 9.
        </Text>
      </Card>

      <Divider />

      <Title level={3}>5. Thiết lập test case nâng cao</Title>
      <Paragraph>
        Ngoài đầu vào và đầu ra cơ bản, bạn có thể thiết lập các thông số nâng
        cao cho mỗi test case:
      </Paragraph>

      <ul className="list-disc pl-8 mb-6">
        <li className="mb-2">
          <Text strong>Giới hạn thời gian (ms):</Text> Thời gian tối đa được
          phép để thực thi test case (mặc định: 1000ms).
        </li>
        <li className="mb-2">
          <Text strong>Giới hạn bộ nhớ (KB):</Text> Lượng bộ nhớ tối đa được
          phép sử dụng (mặc định: 262144KB = 256MB).
        </li>
        <li className="mb-2">
          <Text strong>Trọng số:</Text> Xác định giá trị điểm của test case, các
          test case quan trọng hơn có thể có trọng số cao hơn.
        </li>
        <li className="mb-2">
          <Text strong>Chế độ so sánh:</Text>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <Text code>EXACT</Text>: So khớp chính xác đầu ra (mặc định)
            </li>
            <li>
              <Text code>NUMERIC</Text>: So sánh số học với dung sai epsilon
            </li>
            <li>
              <Text code>STRING_IGNORE_CASE</Text>: So sánh chuỗi không phân
              biệt hoa thường
            </li>
          </ul>
        </li>
        <li className="mb-2">
          <Text strong>Epsilon:</Text> Dung sai cho so sánh số học (chỉ áp dụng
          với chế độ NUMERIC).
        </li>
        <li className="mb-2">
          <Text strong>Test case ví dụ:</Text> Nếu bật, test case này sẽ được
          hiển thị trong mô tả bài toán.
        </li>
        <li className="mb-2">
          <Text strong>Test case ẩn:</Text> Nếu bật, người dùng sẽ không thấy
          đầu vào/đầu ra của test case này khi nộp bài.
        </li>
      </ul>

      <Divider />

      <Title level={3}>6. Các tình trạng kết quả test case</Title>
      <Paragraph>
        Mỗi test case có thể có một trong các trạng thái sau:
      </Paragraph>

      <ul className="list-disc pl-8 mb-6">
        <li className="mb-2">
          <Text strong className="text-green-500">
            PASSED:
          </Text>{" "}
          Test case được thực thi thành công và kết quả đúng với kết quả mong
          đợi.
        </li>
        <li className="mb-2">
          <Text strong className="text-red-500">
            FAILED:
          </Text>{" "}
          Test case được thực thi thành công nhưng kết quả không khớp với kết
          quả mong đợi.
        </li>
        <li className="mb-2">
          <Text strong className="text-yellow-500">
            TIME_LIMIT_EXCEEDED:
          </Text>{" "}
          Thời gian thực thi vượt quá giới hạn đã thiết lập.
        </li>
        <li className="mb-2">
          <Text strong className="text-red-500">
            MEMORY_LIMIT_EXCEEDED:
          </Text>{" "}
          Mã nguồn sử dụng bộ nhớ vượt quá giới hạn đã thiết lập.
        </li>
        <li className="mb-2">
          <Text strong className="text-red-500">
            RUNTIME_ERROR:
          </Text>{" "}
          Có lỗi xảy ra trong quá trình thực thi (ví dụ: null pointer, chia cho
          0).
        </li>
        <li className="mb-2">
          <Text strong className="text-red-500">
            COMPILE_ERROR:
          </Text>{" "}
          Mã nguồn không thể được biên dịch thành công.
        </li>
        <li className="mb-2">
          <Text strong className="text-red-500">
            SYSTEM_ERROR:
          </Text>{" "}
          Có lỗi hệ thống xảy ra trong quá trình đánh giá.
        </li>
      </ul>

      <Alert
        message="Lưu ý quan trọng"
        description={
          <div>
            <p>Khi tạo test cases, hãy đảm bảo bạn có:</p>
            <ul className="list-disc pl-6 mt-2">
              <li>Test cases đơn giản cho các trường hợp cơ bản</li>
              <li>Test cases cho các trường hợp biên</li>
              <li>Test cases với dữ liệu lớn để kiểm tra hiệu suất</li>
              <li>Test cases để bắt các trường hợp đặc biệt và ngoại lệ</li>
            </ul>
          </div>
        }
        type="warning"
        showIcon
        className="mb-6"
      />
    </div>
  );
};

export default HelpDocumentation;
