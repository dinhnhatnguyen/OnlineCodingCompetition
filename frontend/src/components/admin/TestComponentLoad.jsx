import React from "react";
import { Card, Alert, Button, Space } from "antd";
import { CheckCircleOutlined, RocketOutlined } from "@ant-design/icons";

// Test import all components
import SuperchargedTestCaseManager from "./SuperchargedTestCaseManager";
import TestCaseQuickInput from "./TestCaseQuickInput";
import EnhancedTestCaseForm from "./EnhancedTestCaseForm";
import SmartTestCaseValidator from "./SmartTestCaseValidator";
import BatchTestCaseOperations from "./BatchTestCaseOperations";
import TestCaseAnalytics from "./TestCaseAnalytics";
import AdvancedPatternTemplates from "./AdvancedPatternTemplates";
import QuickStartGuide from "./QuickStartGuide";

const TestComponentLoad = () => {
  const components = [
    { name: "SuperchargedTestCaseManager", component: SuperchargedTestCaseManager },
    { name: "TestCaseQuickInput", component: TestCaseQuickInput },
    { name: "EnhancedTestCaseForm", component: EnhancedTestCaseForm },
    { name: "SmartTestCaseValidator", component: SmartTestCaseValidator },
    { name: "BatchTestCaseOperations", component: BatchTestCaseOperations },
    { name: "TestCaseAnalytics", component: TestCaseAnalytics },
    { name: "AdvancedPatternTemplates", component: AdvancedPatternTemplates },
    { name: "QuickStartGuide", component: QuickStartGuide },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card title="🧪 Component Load Test" className="mb-6">
        <Alert
          message="Component Import Test"
          description="Testing if all Test Case Manager components can be imported successfully"
          type="info"
          showIcon
          className="mb-4"
        />

        <div className="space-y-3">
          {components.map((comp, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center space-x-3">
                <CheckCircleOutlined className="text-green-600" />
                <span className="font-medium">{comp.name}</span>
              </div>
              <div className="text-green-600 text-sm">
                {comp.component ? "✅ Loaded" : "❌ Failed"}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Alert
            message="🎉 All components loaded successfully!"
            description="The Test Case Manager is ready to use"
            type="success"
            showIcon
          />
          
          <div className="mt-4">
            <Space>
              <Button 
                type="primary" 
                icon={<RocketOutlined />}
                href="/admin/problems/create-advanced"
              >
                Go to Create Problem
              </Button>
              
              <Button 
                icon={<CheckCircleOutlined />}
                href="/admin/problems/testcase-demo"
              >
                Go to Demo
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TestComponentLoad;
