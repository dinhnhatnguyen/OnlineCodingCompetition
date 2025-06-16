import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Select,
  Alert,
  Button,
  Space,
  Tooltip,
  Popover,
} from "antd";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  BugOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;

const SmartTestCaseValidator = ({ testCase, index, onChange }) => {
  const [validationErrors, setValidationErrors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    validateTestCase();
  }, [testCase]);

  const validateTestCase = () => {
    const errors = [];
    const newSuggestions = [];

    // Validate description
    if (!testCase.description || testCase.description.trim().length < 3) {
      errors.push("Mô tả phải có ít nhất 3 ký tự");
    }

    // Validate input data
    if (!testCase.inputData || testCase.inputData.trim() === "") {
      errors.push("Dữ liệu đầu vào là bắt buộc");
    } else {
      try {
        const inputData = JSON.parse(testCase.inputData);
        if (!Array.isArray(inputData)) {
          errors.push("Dữ liệu đầu vào phải là mảng JSON");
        } else {
          inputData.forEach((item, idx) => {
            if (
              !item.hasOwnProperty("input") ||
              !item.hasOwnProperty("dataType")
            ) {
              errors.push(
                `Input item ${idx + 1} thiếu trường 'input' hoặc 'dataType'`
              );
            }
          });
        }
      } catch (e) {
        errors.push("Dữ liệu đầu vào phải là JSON hợp lệ");
        newSuggestions.push({
          type: "fix",
          message: "Tự động sửa định dạng JSON",
          action: () => autoFixJSON("inputData"),
        });
      }
    }

    // Validate expected output data
    if (
      !testCase.expectedOutputData ||
      testCase.expectedOutputData.trim() === ""
    ) {
      errors.push("Dữ liệu đầu ra mong đợi là bắt buộc");
    } else {
      try {
        const outputData = JSON.parse(testCase.expectedOutputData);
        if (
          !outputData.hasOwnProperty("expectedOutput") ||
          !outputData.hasOwnProperty("dataType")
        ) {
          errors.push(
            "Dữ liệu đầu ra thiếu trường 'expectedOutput' hoặc 'dataType'"
          );
        }
      } catch (e) {
        errors.push("Dữ liệu đầu ra mong đợi phải là JSON hợp lệ");
        newSuggestions.push({
          type: "fix",
          message: "Tự động sửa định dạng JSON",
          action: () => autoFixJSON("expectedOutputData"),
        });
      }
    }

    // Validate required fields for complete structure
    if (!testCase.inputType) {
      errors.push("Loại dữ liệu đầu vào (inputType) là bắt buộc");
    }

    if (!testCase.outputType) {
      errors.push("Loại dữ liệu đầu ra (outputType) là bắt buộc");
    }

    if (!testCase.comparisonMode) {
      errors.push("Chế độ so sánh (comparisonMode) là bắt buộc");
    }

    // Validate time limit
    if (!testCase.timeLimit || testCase.timeLimit < 100) {
      errors.push("Giới hạn thời gian phải ít nhất 100ms");
    }

    // Validate memory limit
    if (!testCase.memoryLimit || testCase.memoryLimit < 1024) {
      errors.push("Giới hạn bộ nhớ phải ít nhất 1024KB");
    }

    // Validate test order
    if (!testCase.testOrder || testCase.testOrder < 1) {
      errors.push("Thứ tự test case phải lớn hơn 0");
    }

    setValidationErrors(errors);
    setSuggestions(newSuggestions);
  };

  const autoFixJSON = (field) => {
    let value = testCase[field];

    // Common JSON fixes
    value = value.replace(/'/g, '"'); // Replace single quotes with double quotes
    value = value.replace(/,\s*}/g, "}"); // Remove trailing commas in objects
    value = value.replace(/,\s*]/g, "]"); // Remove trailing commas in arrays

    // Try to parse and stringify to ensure valid JSON
    try {
      const parsed = JSON.parse(value);
      value = JSON.stringify(parsed, null, 2);
      onChange(index, field, value);
    } catch (e) {
      // If still invalid, provide a complete structure matching the sample format
      if (field === "inputData") {
        value = JSON.stringify([{ input: "", dataType: "string" }], null, 2);
      } else {
        value = JSON.stringify(
          { expectedOutput: "", dataType: "string" },
          null,
          2
        );
      }
      onChange(index, field, value);
    }

    // Also ensure other required fields are set
    if (field === "inputData" && !testCase.inputType) {
      onChange(index, "inputType", "string");
    }
    if (field === "expectedOutputData" && !testCase.outputType) {
      onChange(index, "outputType", "string");
    }
    if (!testCase.comparisonMode) {
      onChange(index, "comparisonMode", "EXACT");
    }
  };

  const getValidationStatus = () => {
    if (validationErrors.length === 0) {
      return {
        status: "success",
        icon: <CheckCircleOutlined />,
        color: "green",
      };
    }
    return {
      status: "error",
      icon: <ExclamationCircleOutlined />,
      color: "red",
    };
  };

  const renderValidationPopover = () => {
    const validation = getValidationStatus();

    return (
      <Popover
        content={
          <div className="max-w-xs">
            {validationErrors.length > 0 ? (
              <div>
                <h4 className="font-semibold text-red-600 mb-2">
                  Lỗi validation:
                </h4>
                <ul className="list-disc pl-4 space-y-1">
                  {validationErrors.map((error, i) => (
                    <li key={i} className="text-sm text-red-600">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="text-green-600">
                <CheckCircleOutlined className="mr-2" />
                Tất cả validation đều đạt!
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="mt-3">
                <h4 className="font-semibold text-blue-600 mb-2">Gợi ý:</h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, i) => (
                    <Button
                      key={i}
                      size="small"
                      type="link"
                      onClick={suggestion.action}
                      className="p-0 h-auto"
                    >
                      {suggestion.message}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        }
        title="Trạng thái validation"
        trigger="hover"
      >
        <Button
          size="small"
          type="text"
          icon={validation.icon}
          style={{ color: validation.color }}
        />
      </Popover>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold">Chi tiết Test Case</h4>
        {renderValidationPopover()}
      </div>

      <Form layout="vertical">
        <Form.Item label="Mô tả" required>
          <Input
            value={testCase.description}
            onChange={(e) => onChange(index, "description", e.target.value)}
            placeholder="Mô tả test case này kiểm tra điều gì"
          />
        </Form.Item>

        <Form.Item label="Dữ liệu đầu vào" required>
          <TextArea
            rows={4}
            value={testCase.inputData}
            onChange={(e) => onChange(index, "inputData", e.target.value)}
            placeholder='[{"input": "[1,2,3]", "dataType": "int[]"}]'
          />
          <div className="text-xs text-gray-500 mt-1">
            Định dạng JSON: Mảng các đối tượng input với giá trị input và
            dataType
          </div>
        </Form.Item>

        <Form.Item label="Dữ liệu đầu ra mong đợi" required>
          <TextArea
            rows={3}
            value={testCase.expectedOutputData}
            onChange={(e) =>
              onChange(index, "expectedOutputData", e.target.value)
            }
            placeholder='{"expectedOutput": "6", "dataType": "int"}'
          />
          <div className="text-xs text-gray-500 mt-1">
            Định dạng JSON: Đối tượng với expectedOutput và dataType
          </div>
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Loại dữ liệu đầu vào" required>
            <Select
              value={testCase.inputType}
              onChange={(value) => onChange(index, "inputType", value)}
              placeholder="Chọn loại dữ liệu"
            >
              <Option value="string">String</Option>
              <Option value="int">Integer</Option>
              <Option value="double">Double</Option>
              <Option value="boolean">Boolean</Option>
              <Option value="array">Array</Option>
              <Option value="int[]">Integer Array</Option>
              <Option value="string[]">String Array</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Loại dữ liệu đầu ra" required>
            <Select
              value={testCase.outputType}
              onChange={(value) => onChange(index, "outputType", value)}
              placeholder="Chọn loại dữ liệu"
            >
              <Option value="string">String</Option>
              <Option value="int">Integer</Option>
              <Option value="double">Double</Option>
              <Option value="boolean">Boolean</Option>
              <Option value="array">Array</Option>
              <Option value="int[]">Integer Array</Option>
              <Option value="string[]">String Array</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Chế độ so sánh" required>
            <Select
              value={testCase.comparisonMode}
              onChange={(value) => onChange(index, "comparisonMode", value)}
              placeholder="Chọn chế độ so sánh"
            >
              <Option value="EXACT">Chính xác</Option>
              <Option value="IGNORE_WHITESPACE">Bỏ qua khoảng trắng</Option>
              <Option value="EPSILON">Sai số epsilon</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Epsilon (cho số thực)">
            <InputNumber
              min={0}
              max={1}
              step={0.0001}
              value={testCase.epsilon}
              onChange={(value) => onChange(index, "epsilon", value)}
              className="w-full"
              disabled={testCase.comparisonMode !== "EPSILON"}
              placeholder="0.0001"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item label="Giới hạn thời gian (ms)">
            <InputNumber
              min={100}
              max={10000}
              value={testCase.timeLimit}
              onChange={(value) => onChange(index, "timeLimit", value)}
              className="w-full"
            />
          </Form.Item>

          <Form.Item label="Giới hạn bộ nhớ (KB)">
            <InputNumber
              min={1024}
              max={1048576}
              value={testCase.memoryLimit}
              onChange={(value) => onChange(index, "memoryLimit", value)}
              className="w-full"
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Form.Item label="Trọng số">
            <InputNumber
              min={0.1}
              max={10}
              step={0.1}
              value={testCase.weight}
              onChange={(value) => onChange(index, "weight", value)}
              className="w-full"
            />
          </Form.Item>

          <Form.Item label="Test case ví dụ">
            <Switch
              checked={testCase.isExample}
              onChange={(checked) => onChange(index, "isExample", checked)}
            />
          </Form.Item>

          <Form.Item label="Test case ẩn">
            <Switch
              checked={testCase.isHidden}
              onChange={(checked) => onChange(index, "isHidden", checked)}
            />
          </Form.Item>
        </div>
      </Form>

      {validationErrors.length > 0 && (
        <Alert
          message="Vấn đề validation"
          description={
            <ul className="list-disc pl-4">
              {validationErrors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          }
          type="error"
          showIcon
          action={
            suggestions.length > 0 && (
              <Space>
                {suggestions.map((suggestion, i) => (
                  <Button
                    key={i}
                    size="small"
                    type="primary"
                    onClick={suggestion.action}
                  >
                    {suggestion.message}
                  </Button>
                ))}
              </Space>
            )
          }
        />
      )}
    </div>
  );
};

export default SmartTestCaseValidator;
