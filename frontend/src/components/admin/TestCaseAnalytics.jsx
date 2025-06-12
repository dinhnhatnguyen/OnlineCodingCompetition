import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Alert,
  Table,
  Tag,
  Tooltip,
  Button,
  Select,
  Space,
} from "antd";
import {
  BarChartOutlined,
  PieChartOutlined,
  TrophyOutlined,
  BugOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const TestCaseAnalytics = ({ testCases }) => {
  const [analytics, setAnalytics] = useState({});
  const [selectedMetric, setSelectedMetric] = useState("overview");

  useEffect(() => {
    if (testCases && testCases.length > 0) {
      calculateAnalytics();
    }
  }, [testCases]);

  const calculateAnalytics = () => {
    const total = testCases.length;
    const examples = testCases.filter((tc) => tc.isExample).length;
    const hidden = testCases.filter((tc) => tc.isHidden).length;
    const visible = total - hidden;

    // Time limit analysis
    const timeLimits = testCases.map((tc) => tc.timeLimit || 1000);
    const avgTimeLimit =
      timeLimits.reduce((a, b) => a + b, 0) / timeLimits.length;
    const maxTimeLimit = Math.max(...timeLimits);
    const minTimeLimit = Math.min(...timeLimits);

    // Memory limit analysis
    const memoryLimits = testCases.map((tc) => tc.memoryLimit || 262144);
    const avgMemoryLimit =
      memoryLimits.reduce((a, b) => a + b, 0) / memoryLimits.length;

    // Weight distribution
    const weights = testCases.map((tc) => tc.weight || 1.0);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    // Complexity analysis
    const complexityDistribution = analyzeComplexity();

    // Quality score
    const qualityScore = calculateQualityScore();

    setAnalytics({
      total,
      examples,
      hidden,
      visible,
      avgTimeLimit: Math.round(avgTimeLimit),
      maxTimeLimit,
      minTimeLimit,
      avgMemoryLimit: Math.round(avgMemoryLimit / 1024), // Convert to MB
      totalWeight: Math.round(totalWeight * 10) / 10,
      complexityDistribution,
      qualityScore,
    });
  };

  const analyzeComplexity = () => {
    const complexity = {
      simple: 0,
      medium: 0,
      complex: 0,
    };

    testCases.forEach((tc) => {
      try {
        const inputData = JSON.parse(tc.inputData || "[]");
        const inputSize = estimateInputSize(inputData);

        if (inputSize < 100) complexity.simple++;
        else if (inputSize < 1000) complexity.medium++;
        else complexity.complex++;
      } catch (e) {
        complexity.simple++; // Default to simple if can't parse
      }
    });

    return complexity;
  };

  const estimateInputSize = (inputData) => {
    if (!Array.isArray(inputData)) return 1;

    return inputData.reduce((size, input) => {
      try {
        const value = JSON.parse(input.input || "1");
        if (Array.isArray(value)) return size + value.length;
        if (typeof value === "string") return size + value.length;
        return size + 1;
      } catch (e) {
        return size + 1;
      }
    }, 0);
  };

  const calculateQualityScore = () => {
    let score = 0;
    const maxScore = 100;

    // Test case coverage (30 points)
    const coverageScore = Math.min(30, (testCases.length / 10) * 30);
    score += coverageScore;

    // Example cases (20 points)
    const exampleScore =
      testCases.filter((tc) => tc.isExample).length > 0 ? 20 : 0;
    score += exampleScore;

    // Edge cases (25 points)
    const edgeCaseScore =
      testCases.filter(
        (tc) =>
          tc.description?.toLowerCase().includes("edge") ||
          tc.description?.toLowerCase().includes("empty") ||
          tc.description?.toLowerCase().includes("single")
      ).length > 0
        ? 25
        : 0;
    score += edgeCaseScore;

    // Stress tests (15 points)
    const stressTestScore =
      testCases.filter(
        (tc) =>
          tc.description?.toLowerCase().includes("stress") ||
          tc.description?.toLowerCase().includes("large") ||
          tc.isHidden
      ).length > 0
        ? 15
        : 0;
    score += stressTestScore;

    // Description quality (10 points)
    const descriptionScore = testCases.every(
      (tc) => tc.description && tc.description.length > 5
    )
      ? 10
      : 0;
    score += descriptionScore;

    return Math.round(score);
  };

  const getQualityColor = (score) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "exception";
  };

  const getQualityText = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const renderOverview = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Total Test Cases"
            value={analytics.total}
            prefix={<BarChartOutlined />}
            valueStyle={{ color: "#1890ff" }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Example Cases"
            value={analytics.examples}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: "#52c41a" }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Hidden Cases"
            value={analytics.hidden}
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: "#fa8c16" }}
          />
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Quality Score"
            value={analytics.qualityScore}
            suffix="/ 100"
            prefix={<TrophyOutlined />}
            valueStyle={{
              color:
                analytics.qualityScore >= 80
                  ? "#52c41a"
                  : analytics.qualityScore >= 60
                  ? "#fa8c16"
                  : "#ff4d4f",
            }}
          />
        </Card>
      </Col>
    </Row>
  );

  const renderQualityAnalysis = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12}>
        <Card title="📊 Quality Assessment">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Overall Quality</span>
                <span className="font-semibold">
                  {getQualityText(analytics.qualityScore)}
                </span>
              </div>
              <Progress
                percent={analytics.qualityScore}
                status={getQualityColor(analytics.qualityScore)}
                strokeColor={{
                  "0%": "#ff4d4f",
                  "50%": "#fa8c16",
                  "100%": "#52c41a",
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Coverage:</span>
                <span className="ml-2 font-medium">
                  {Math.min(100, (analytics.total / 10) * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-gray-500">Examples:</span>
                <span className="ml-2 font-medium">
                  {analytics.examples > 0 ? "✓" : "✗"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Edge Cases:</span>
                <span className="ml-2 font-medium">
                  {testCases.some((tc) =>
                    tc.description?.toLowerCase().includes("edge")
                  )
                    ? "✓"
                    : "✗"}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Stress Tests:</span>
                <span className="ml-2 font-medium">
                  {testCases.some((tc) => tc.isHidden) ? "✓" : "✗"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Col>

      <Col xs={24} md={12}>
        <Card title="🎯 Complexity Distribution">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span>Simple Cases</span>
                <span>{analytics.complexityDistribution?.simple || 0}</span>
              </div>
              <Progress
                percent={
                  ((analytics.complexityDistribution?.simple || 0) /
                    analytics.total) *
                  100
                }
                strokeColor="#52c41a"
                showInfo={false}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Medium Cases</span>
                <span>{analytics.complexityDistribution?.medium || 0}</span>
              </div>
              <Progress
                percent={
                  ((analytics.complexityDistribution?.medium || 0) /
                    analytics.total) *
                  100
                }
                strokeColor="#fa8c16"
                showInfo={false}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Complex Cases</span>
                <span>{analytics.complexityDistribution?.complex || 0}</span>
              </div>
              <Progress
                percent={
                  ((analytics.complexityDistribution?.complex || 0) /
                    analytics.total) *
                  100
                }
                strokeColor="#ff4d4f"
                showInfo={false}
              />
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );

  const renderPerformanceMetrics = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Avg Time Limit"
            value={analytics.avgTimeLimit}
            suffix="ms"
            prefix={<ClockCircleOutlined />}
          />
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Avg Memory Limit"
            value={analytics.avgMemoryLimit}
            suffix="MB"
            prefix={<DatabaseOutlined />}
          />
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card>
          <Statistic
            title="Total Weight"
            value={analytics.totalWeight}
            prefix={<TrophyOutlined />}
          />
        </Card>
      </Col>
    </Row>
  );

  const testCaseColumns = [
    {
      title: "#",
      dataIndex: "testOrder",
      key: "testOrder",
      width: 50,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Type",
      key: "type",
      width: 120,
      render: (_, record) => (
        <Space>
          {record.isExample && <Tag color="blue">Example</Tag>}
          {record.isHidden && <Tag color="orange">Hidden</Tag>}
        </Space>
      ),
    },
    {
      title: "Time (ms)",
      dataIndex: "timeLimit",
      key: "timeLimit",
      width: 100,
    },
    {
      title: "Memory (KB)",
      dataIndex: "memoryLimit",
      key: "memoryLimit",
      width: 120,
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
      width: 80,
    },
  ];

  const renderDetailedView = () => (
    <Card title="📋 Detailed Test Case Analysis">
      <Table
        columns={testCaseColumns}
        dataSource={testCases}
        rowKey={(record, index) => index}
        pagination={{ pageSize: 10 }}
        size="small"
      />
    </Card>
  );

  const renderRecommendations = () => {
    const recommendations = [];

    if (analytics.total < 5) {
      recommendations.push({
        type: "warning",
        message: "Consider adding more test cases for better coverage",
        action: "Add at least 5-10 test cases",
      });
    }

    if (analytics.examples === 0) {
      recommendations.push({
        type: "error",
        message: "No example test cases found",
        action: "Add at least 1-2 example cases for students",
      });
    }

    if (analytics.hidden === 0) {
      recommendations.push({
        type: "warning",
        message: "No hidden test cases for evaluation",
        action: "Add hidden test cases to prevent hardcoding",
      });
    }

    if (analytics.qualityScore < 60) {
      recommendations.push({
        type: "error",
        message: "Test case quality needs improvement",
        action: "Add edge cases, stress tests, and better descriptions",
      });
    }

    return (
      <Card title="💡 Recommendations">
        {recommendations.length === 0 ? (
          <Alert
            message="Great job! Your test cases look comprehensive."
            type="success"
            showIcon
          />
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <Alert
                key={index}
                message={rec.message}
                description={rec.action}
                type={rec.type}
                showIcon
              />
            ))}
          </div>
        )}
      </Card>
    );
  };

  if (!testCases || testCases.length === 0) {
    return (
      <Card title="📊 Test Case Analytics">
        <Alert
          message="No test cases to analyze"
          description="Add some test cases to see analytics and recommendations"
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card title="📊 Test Case Analytics">
        <div className="mb-4">
          <Select
            value={selectedMetric}
            onChange={setSelectedMetric}
            style={{ width: 200 }}
          >
            <Option value="overview">Overview</Option>
            <Option value="quality">Quality Analysis</Option>
            <Option value="performance">Performance Metrics</Option>
            <Option value="detailed">Detailed View</Option>
          </Select>
        </div>

        {selectedMetric === "overview" && renderOverview()}
        {selectedMetric === "quality" && renderQualityAnalysis()}
        {selectedMetric === "performance" && renderPerformanceMetrics()}
        {selectedMetric === "detailed" && renderDetailedView()}
      </Card>

      {renderRecommendations()}
    </div>
  );
};

export default TestCaseAnalytics;
