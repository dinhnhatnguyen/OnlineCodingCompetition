import React, { useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Alert,
  Tag,
  Divider,
  Collapse,
  InputNumber,
  Switch,
  message,
} from "antd";
import {
  CodeOutlined,
  BulbOutlined,
  RocketOutlined,
  SettingOutlined,
  PlusOutlined,
  EditOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

// Advanced algorithm patterns
const ADVANCED_PATTERNS = {
  dynamic_programming: {
    name: "Dynamic Programming",
    description: "Bài toán quy hoạch động",
    difficulty: "Hard",
    examples: ["Fibonacci", "Knapsack", "Longest Common Subsequence"],
    testCaseTemplate: {
      inputs: [{ type: "int", value: "10" }],
      output: { type: "int", value: "55" },
      edgeCases: [
        { inputs: [{ type: "int", value: "0" }], output: { type: "int", value: "0" } },
        { inputs: [{ type: "int", value: "1" }], output: { type: "int", value: "1" } },
        { inputs: [{ type: "int", value: "20" }], output: { type: "int", value: "6765" } },
      ]
    }
  },
  graph_algorithms: {
    name: "Graph Algorithms",
    description: "Thuật toán đồ thị",
    difficulty: "Hard",
    examples: ["DFS", "BFS", "Dijkstra", "MST"],
    testCaseTemplate: {
      inputs: [
        { type: "int[][]", value: "[[0,1,1],[1,0,1],[1,1,0]]" },
        { type: "int", value: "0" }
      ],
      output: { type: "int[]", value: "[0,1,2]" },
      edgeCases: [
        { inputs: [{ type: "int[][]", value: "[[0]]" }, { type: "int", value: "0" }], output: { type: "int[]", value: "[0]" } },
        { inputs: [{ type: "int[][]", value: "[[0,0],[0,0]]" }, { type: "int", value: "0" }], output: { type: "int[]", value: "[0]" } },
      ]
    }
  },
  tree_algorithms: {
    name: "Tree Algorithms",
    description: "Thuật toán cây",
    difficulty: "Medium",
    examples: ["Tree Traversal", "Binary Search Tree", "Tree Height"],
    testCaseTemplate: {
      inputs: [{ type: "TreeNode", value: "[1,2,3,4,5]" }],
      output: { type: "int", value: "3" },
      edgeCases: [
        { inputs: [{ type: "TreeNode", value: "[]" }], output: { type: "int", value: "0" } },
        { inputs: [{ type: "TreeNode", value: "[1]" }], output: { type: "int", value: "1" } },
      ]
    }
  },
  backtracking: {
    name: "Backtracking",
    description: "Thuật toán quay lui",
    difficulty: "Hard",
    examples: ["N-Queens", "Sudoku Solver", "Permutations"],
    testCaseTemplate: {
      inputs: [{ type: "int", value: "4" }],
      output: { type: "int[][]", value: "[[1,3,0,2],[2,0,3,1]]" },
      edgeCases: [
        { inputs: [{ type: "int", value: "1" }], output: { type: "int[][]", value: "[[0]]" } },
        { inputs: [{ type: "int", value: "2" }], output: { type: "int[][]", value: "[]" } },
      ]
    }
  },
  greedy_algorithms: {
    name: "Greedy Algorithms",
    description: "Thuật toán tham lam",
    difficulty: "Medium",
    examples: ["Activity Selection", "Huffman Coding", "Fractional Knapsack"],
    testCaseTemplate: {
      inputs: [
        { type: "int[]", value: "[1,3,0,5,8,5]" },
        { type: "int[]", value: "[2,4,6,7,9,9]" }
      ],
      output: { type: "int", value: "3" },
      edgeCases: [
        { inputs: [{ type: "int[]", value: "[1]" }, { type: "int[]", value: "[2]" }], output: { type: "int", value: "1" } },
        { inputs: [{ type: "int[]", value: "[]" }, { type: "int[]", value: "[]" }], output: { type: "int", value: "0" } },
      ]
    }
  }
};

const AdvancedPatternTemplates = ({ onTemplateApply }) => {
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customForm] = Form.useForm();

  const generateAdvancedTestCases = (patternKey) => {
    const pattern = ADVANCED_PATTERNS[patternKey];
    const template = pattern.testCaseTemplate;
    
    const testCases = [
      // Basic test case
      {
        inputs: template.inputs,
        output: template.output,
        description: `Basic ${pattern.name} case`,
        isExample: true,
        weight: 2.0,
      },
      // Edge cases
      ...template.edgeCases.map((edgeCase, index) => ({
        inputs: edgeCase.inputs,
        output: edgeCase.output,
        description: `Edge case ${index + 1}`,
        isExample: false,
        weight: 1.0,
      })),
      // Stress test
      {
        inputs: template.inputs.map(input => ({
          ...input,
          value: generateStressTestValue(input.type)
        })),
        output: { type: template.output.type, value: "999999" },
        description: "Stress test - large input",
        isExample: false,
        isHidden: true,
        weight: 1.5,
      }
    ];

    return testCases.map((testCase, index) => ({
      inputData: JSON.stringify(
        testCase.inputs.map((input) => ({
          input: input.value,
          dataType: input.type,
        }))
      ),
      expectedOutputData: JSON.stringify({
        expectedOutput: testCase.output.value,
        dataType: testCase.output.type,
      }),
      description: testCase.description,
      isExample: testCase.isExample || false,
      isHidden: testCase.isHidden || false,
      timeLimit: getTimeLimit(patternKey),
      memoryLimit: getMemoryLimit(patternKey),
      weight: testCase.weight,
      testOrder: index + 1,
    }));
  };

  const generateStressTestValue = (type) => {
    switch (type) {
      case "int":
        return "1000000";
      case "int[]":
        return "[" + Array.from({length: 1000}, (_, i) => i).join(",") + "]";
      case "int[][]":
        return "[[" + Array.from({length: 100}, () => 
          Array.from({length: 100}, (_, i) => i % 2).join(",")
        ).join("],[") + "]]";
      default:
        return "1000000";
    }
  };

  const getTimeLimit = (patternKey) => {
    const timeLimits = {
      dynamic_programming: 2000,
      graph_algorithms: 3000,
      tree_algorithms: 1500,
      backtracking: 5000,
      greedy_algorithms: 1000,
    };
    return timeLimits[patternKey] || 1000;
  };

  const getMemoryLimit = (patternKey) => {
    const memoryLimits = {
      dynamic_programming: 524288,
      graph_algorithms: 1048576,
      tree_algorithms: 262144,
      backtracking: 1048576,
      greedy_algorithms: 262144,
    };
    return memoryLimits[patternKey] || 262144;
  };

  const handlePatternSelect = (patternKey) => {
    const testCases = generateAdvancedTestCases(patternKey);
    onTemplateApply(testCases);
    message.success(`Applied ${ADVANCED_PATTERNS[patternKey].name} template with ${testCases.length} test cases!`);
  };

  const renderPatternCard = (key, pattern) => (
    <Card
      key={key}
      hoverable
      className={`cursor-pointer transition-all ${
        selectedPattern === key ? "border-blue-500 shadow-lg" : ""
      }`}
      onClick={() => setSelectedPattern(key)}
    >
      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-semibold text-lg">{pattern.name}</h4>
            <p className="text-gray-600 text-sm">{pattern.description}</p>
          </div>
          <Tag color={pattern.difficulty === "Hard" ? "red" : pattern.difficulty === "Medium" ? "orange" : "green"}>
            {pattern.difficulty}
          </Tag>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-1">Examples:</p>
          <div className="flex flex-wrap gap-1">
            {pattern.examples.map((example, index) => (
              <Tag key={index} size="small">{example}</Tag>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-gray-500">
            {pattern.testCaseTemplate.edgeCases.length + 2} test cases
          </span>
          <Button
            type="primary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handlePatternSelect(key);
            }}
          >
            Apply Template
          </Button>
        </div>
      </div>
    </Card>
  );

  const handleCustomTemplate = async () => {
    try {
      const values = await customForm.validateFields();
      
      // Generate custom test cases based on form input
      const customTestCases = [{
        inputData: JSON.stringify([{ input: values.sampleInput, dataType: values.inputType }]),
        expectedOutputData: JSON.stringify({ expectedOutput: values.sampleOutput, dataType: values.outputType }),
        description: values.description || "Custom test case",
        isExample: true,
        isHidden: false,
        timeLimit: values.timeLimit || 1000,
        memoryLimit: values.memoryLimit || 262144,
        weight: 1.0,
        testOrder: 1,
      }];
      
      onTemplateApply(customTestCases);
      message.success("Applied custom template!");
      setCustomModalVisible(false);
      customForm.resetFields();
    } catch (error) {
      message.error("Please fill all required fields");
    }
  };

  return (
    <div className="space-y-6">
      <Card title="🎯 Advanced Algorithm Patterns" className="mb-4">
        <Alert
          message="Professional Templates"
          description="Choose from advanced algorithm patterns with optimized test cases, time limits, and edge cases"
          type="info"
          showIcon
          className="mb-4"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(ADVANCED_PATTERNS).map(([key, pattern]) =>
            renderPatternCard(key, pattern)
          )}
        </div>
      </Card>

      <Card title="🛠️ Custom Template Builder">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">Create your own test case template with custom parameters</p>
          </div>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => setCustomModalVisible(true)}
          >
            Create Custom Template
          </Button>
        </div>
      </Card>

      <Modal
        title="🛠️ Custom Template Builder"
        open={customModalVisible}
        onCancel={() => setCustomModalVisible(false)}
        onOk={handleCustomTemplate}
        width={600}
      >
        <Form form={customForm} layout="vertical">
          <Form.Item
            name="description"
            label="Template Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input placeholder="e.g., Custom sorting algorithm" />
          </Form.Item>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="inputType"
              label="Input Type"
              rules={[{ required: true, message: "Please select input type" }]}
            >
              <Select placeholder="Select type">
                <Option value="int">int</Option>
                <Option value="int[]">int[]</Option>
                <Option value="String">String</Option>
                <Option value="boolean">boolean</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="outputType"
              label="Output Type"
              rules={[{ required: true, message: "Please select output type" }]}
            >
              <Select placeholder="Select type">
                <Option value="int">int</Option>
                <Option value="int[]">int[]</Option>
                <Option value="String">String</Option>
                <Option value="boolean">boolean</Option>
              </Select>
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="sampleInput"
              label="Sample Input"
              rules={[{ required: true, message: "Please enter sample input" }]}
            >
              <TextArea rows={3} placeholder="e.g., [1,2,3,4,5]" />
            </Form.Item>
            
            <Form.Item
              name="sampleOutput"
              label="Sample Output"
              rules={[{ required: true, message: "Please enter sample output" }]}
            >
              <TextArea rows={3} placeholder="e.g., [1,2,3,4,5]" />
            </Form.Item>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="timeLimit" label="Time Limit (ms)">
              <InputNumber min={100} max={10000} className="w-full" placeholder="1000" />
            </Form.Item>
            
            <Form.Item name="memoryLimit" label="Memory Limit (KB)">
              <InputNumber min={1024} max={1048576} className="w-full" placeholder="262144" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdvancedPatternTemplates;
