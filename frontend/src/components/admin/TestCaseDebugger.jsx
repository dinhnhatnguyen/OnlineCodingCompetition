import { useState, useEffect } from "react";
import { Card, Button, Alert, Collapse } from "antd";
import { BugOutlined, EyeOutlined } from "@ant-design/icons";

const { Panel } = Collapse;

const TestCaseDebugger = ({ form, visible = false }) => {
  const [debugData, setDebugData] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);

  const captureFormData = () => {
    const formValues = form.getFieldsValue();
    const testCases = form.getFieldValue("testCases") || [];
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      formValues: formValues,
      testCases: testCases,
      testCaseCount: testCases.length,
      testCaseStructure: testCases.map((tc, index) => ({
        index,
        hasInputData: !!tc.inputData,
        hasExpectedOutputData: !!tc.expectedOutputData,
        hasInputType: !!tc.inputType,
        hasOutputType: !!tc.outputType,
        hasDescription: !!tc.description,
        hasComparisonMode: !!tc.comparisonMode,
        structure: Object.keys(tc),
      })),
    };

    setDebugData(debugInfo);
    setLastUpdate(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    if (visible) {
      captureFormData();
      
      // Auto-refresh every 2 seconds when visible
      const interval = setInterval(captureFormData, 2000);
      return () => clearInterval(interval);
    }
  }, [visible, form]);

  if (!visible) return null;

  return (
    <Card
      title={
        <div className="flex items-center space-x-2">
          <BugOutlined />
          <span>Test Case Debugger</span>
          {lastUpdate && (
            <span className="text-sm text-gray-500">
              Last update: {lastUpdate}
            </span>
          )}
        </div>
      }
      extra={
        <Button
          icon={<EyeOutlined />}
          onClick={captureFormData}
          size="small"
        >
          Refresh
        </Button>
      }
      className="mt-4"
    >
      <Alert
        message="Debug Information"
        description="This panel shows the current state of test cases in the form for debugging purposes."
        type="info"
        showIcon
        className="mb-4"
      />

      <Collapse defaultActiveKey={["summary"]}>
        <Panel header="Summary" key="summary">
          <div className="space-y-2">
            <div>
              <strong>Test Case Count:</strong> {debugData.testCaseCount || 0}
            </div>
            <div>
              <strong>Last Captured:</strong> {debugData.timestamp || "Never"}
            </div>
            <div>
              <strong>Form Has Test Cases:</strong>{" "}
              {debugData.testCases?.length > 0 ? "✅ Yes" : "❌ No"}
            </div>
          </div>
        </Panel>

        <Panel header="Test Case Structure" key="structure">
          <div className="space-y-3">
            {debugData.testCaseStructure?.map((tc, index) => (
              <div key={index} className="border p-3 rounded">
                <div className="font-semibold mb-2">Test Case #{index + 1}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    Input Data: {tc.hasInputData ? "✅" : "❌"}
                  </div>
                  <div>
                    Expected Output: {tc.hasExpectedOutputData ? "✅" : "❌"}
                  </div>
                  <div>
                    Input Type: {tc.hasInputType ? "✅" : "❌"}
                  </div>
                  <div>
                    Output Type: {tc.hasOutputType ? "✅" : "❌"}
                  </div>
                  <div>
                    Description: {tc.hasDescription ? "✅" : "❌"}
                  </div>
                  <div>
                    Comparison Mode: {tc.hasComparisonMode ? "✅" : "❌"}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  <strong>Fields:</strong> {tc.structure.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel header="Raw Test Cases Data" key="raw">
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(debugData.testCases, null, 2)}
          </pre>
        </Panel>

        <Panel header="Full Form Data" key="full">
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(debugData.formValues, null, 2)}
          </pre>
        </Panel>
      </Collapse>
    </Card>
  );
};

export default TestCaseDebugger;
