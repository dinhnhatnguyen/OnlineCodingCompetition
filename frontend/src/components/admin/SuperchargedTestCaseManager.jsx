import React, { useState, useEffect } from "react";
import {
  Card,
  Tabs,
  Button,
  Space,
  Alert,
  Divider,
  Tooltip,
  Badge,
  message,
  Modal,
} from "antd";
import {
  RocketOutlined,
  BarChartOutlined,
  SettingOutlined,
  AppstoreOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  EditOutlined,
  RobotOutlined,
} from "@ant-design/icons";

// Import all our enhanced components
import TestCaseQuickInput from "./TestCaseQuickInput";
import EnhancedTestCaseForm from "./EnhancedTestCaseForm";
import BatchTestCaseOperations from "./BatchTestCaseOperations";
import TestCaseAnalytics from "./TestCaseAnalytics";
import AdvancedPatternTemplates from "./AdvancedPatternTemplates";
import QuickStartGuide from "./QuickStartGuide";
import TestCaseCreationGuide from "./TestCaseCreationGuide";
import AITestCaseGenerationTab from "./AITestCaseGenerationTab";

const { TabPane } = Tabs;

const SuperchargedTestCaseManager = ({ form, onTestCasesChange }) => {
  const [activeTab, setActiveTab] = useState("quick");
  const [testCases, setTestCases] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showCreationGuide, setShowCreationGuide] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for forcing re-render
  const [stats, setStats] = useState({
    total: 0,
    valid: 0,
    examples: 0,
    hidden: 0,
  });

  // Function to switch to manual editing tab
  const switchToManualTab = () => {
    console.log("🔄 SuperchargedTestCaseManager - Switching to manual tab");
    console.log("📋 Current testCases length:", testCases.length);
    setActiveTab("manual");
    console.log("✅ SuperchargedTestCaseManager - Switched to manual tab");
  };

  // Enhanced sync with form data - watch for changes more effectively
  useEffect(() => {
    const formTestCases = form.getFieldValue("testCases") || [];
    setTestCases(formTestCases);
    updateStats(formTestCases);
  }, [form]);

  // Additional effect to watch for form field changes
  useEffect(() => {
    const handleFormChange = () => {
      const formTestCases = form.getFieldValue("testCases") || [];
      if (JSON.stringify(formTestCases) !== JSON.stringify(testCases)) {
        setTestCases(formTestCases);
        updateStats(formTestCases);
      }
    };

    // Set up a listener for form changes
    const interval = setInterval(handleFormChange, 100);
    return () => clearInterval(interval);
  }, [form, testCases]);

  const updateStats = (testCaseList) => {
    const newStats = {
      total: testCaseList.length,
      valid: testCaseList.filter(
        (tc) => tc.description && tc.inputData && tc.expectedOutputData
      ).length,
      examples: testCaseList.filter((tc) => tc.isExample).length,
      hidden: testCaseList.filter((tc) => tc.isHidden).length,
    };
    setStats(newStats);
  };

  const handleTestCasesUpdate = (newTestCases) => {
    console.log(
      "SuperchargedTestCaseManager - Updating test cases:",
      newTestCases.length,
      "items"
    );
    console.log(
      "SuperchargedTestCaseManager - New test cases data:",
      newTestCases
    );

    setTestCases(newTestCases);
    form.setFieldValue("testCases", newTestCases);
    updateStats(newTestCases);
    onTestCasesChange?.(newTestCases);

    // Force refresh of EnhancedTestCaseForm
    setRefreshKey((prev) => prev + 1);
    console.log(
      "SuperchargedTestCaseManager - Refresh key updated to:",
      refreshKey + 1
    );

    // Verify the form field was set correctly
    const formTestCases = form.getFieldValue("testCases");
    console.log(
      "SuperchargedTestCaseManager - Form test cases after update:",
      formTestCases.length,
      "items"
    );
    console.log(
      "SuperchargedTestCaseManager - Form test cases data:",
      formTestCases
    );
  };

  const handleQuickGenerate = (generatedTestCases) => {
    console.log("🎯 SuperchargedTestCaseManager - handleQuickGenerate called!");
    console.log(
      "📝 Generated test cases received:",
      generatedTestCases.length,
      "items"
    );
    console.log("📋 Current test cases:", testCases.length, "items");

    if (!generatedTestCases || !Array.isArray(generatedTestCases)) {
      console.error("❌ Invalid generated test cases:", generatedTestCases);
      message.error("Dữ liệu test cases không hợp lệ!");
      return;
    }

    if (generatedTestCases.length === 0) {
      console.warn("⚠️ No test cases to add");
      message.warning("Không có test cases nào để thêm!");
      return;
    }

    const currentTestCases = testCases;
    const updatedTestCases = [...currentTestCases, ...generatedTestCases];
    console.log(
      "📝 Updated test cases (current + generated):",
      updatedTestCases.length,
      "total items"
    );

    try {
      // Update test cases
      handleTestCasesUpdate(updatedTestCases);
      console.log("✅ handleTestCasesUpdate called successfully");

      // Show success message
      message.success(`🎉 Đã thêm ${generatedTestCases.length} test cases!`);

      // Auto-switch to manual editing tab after a short delay
      setTimeout(() => {
        console.log("🔄 Switching to manual tab...");
        switchToManualTab();

        // Show info message after switching
        setTimeout(() => {
          message.info(
            "💡 Đã chuyển đến tab 'Chỉnh sửa thủ công' để bạn có thể xem và chỉnh sửa test cases"
          );
        }, 500);
      }, 1500);
    } catch (error) {
      console.error("❌ Error in handleTestCasesUpdate:", error);
      message.error("Có lỗi xảy ra khi cập nhật test cases!");
    }
  };

  const handleAdvancedTemplate = (templateTestCases) => {
    const currentTestCases = testCases;
    const updatedTestCases = [...currentTestCases, ...templateTestCases];
    handleTestCasesUpdate(updatedTestCases);
    message.success(
      `Applied advanced template with ${templateTestCases.length} test cases!`
    );
  };

  const clearAllTestCases = () => {
    Modal.confirm({
      title: "Clear All Test Cases",
      content:
        "Are you sure you want to remove all test cases? This action cannot be undone.",
      okText: "Clear All",
      okType: "danger",
      onOk: () => {
        handleTestCasesUpdate([]);
        message.success("All test cases cleared!");
      },
    });
  };

  const renderTabLabel = (label, icon, count) => (
    <span>
      {icon} {label}
      {count > 0 && (
        <Badge count={count} size="small" style={{ marginLeft: 8 }} />
      )}
    </span>
  );

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          ⚡ Trình quản lý Test Case nâng cao
        </h2>
        <p className="text-gray-600">
          Công cụ chuyên nghiệp để tạo, quản lý và phân tích test cases với
          templates thông minh và tự động hóa
        </p>
      </div>

      <Space>
        <Tooltip title="Hướng dẫn chi tiết tạo test cases">
          <Button
            icon={<AppstoreOutlined />}
            onClick={() => setShowCreationGuide(true)}
            type="primary"
          >
            📚 Hướng dẫn chi tiết
          </Button>
        </Tooltip>

        <Tooltip title="Hướng dẫn nhanh">
          <Button
            icon={<RocketOutlined />}
            onClick={() => setShowQuickStart(true)}
            type="dashed"
          >
            🚀 Quick Start
          </Button>
        </Tooltip>

        <Tooltip title="Xem phân tích">
          <Button
            icon={<BarChartOutlined />}
            onClick={() => setShowAnalytics(!showAnalytics)}
            type={showAnalytics ? "primary" : "default"}
          >
            Phân tích
          </Button>
        </Tooltip>

        <Tooltip title="Xóa tất cả test cases">
          <Button
            danger
            onClick={clearAllTestCases}
            disabled={testCases.length === 0}
          >
            Xóa tất cả
          </Button>
        </Tooltip>
      </Space>
    </div>
  );

  const renderStatsBar = () => (
    <Alert
      message={
        <div className="flex justify-between items-center">
          <div className="flex space-x-6">
            <span>
              <strong>Tổng:</strong> {stats.total}
            </span>
            <span>
              <strong>Hợp lệ:</strong>{" "}
              <span className="text-green-600">{stats.valid}</span>
            </span>
            <span>
              <strong>Ví dụ:</strong>{" "}
              <span className="text-blue-600">{stats.examples}</span>
            </span>
            <span>
              <strong>Ẩn:</strong>{" "}
              <span className="text-orange-600">{stats.hidden}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Chất lượng:{" "}
              {stats.total > 0
                ? Math.round((stats.valid / stats.total) * 100)
                : 0}
              %
            </span>
            <div className="w-16 h-2 bg-gray-200 rounded">
              <div
                className="h-full bg-green-500 rounded"
                style={{
                  width: `${
                    stats.total > 0 ? (stats.valid / stats.total) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      }
      type="info"
      className="mb-4"
    />
  );

  return (
    <div className="space-y-6">
      {renderHeader()}

      {renderStatsBar()}

      {showQuickStart && (
        <Modal
          title={null}
          open={showQuickStart}
          onCancel={() => setShowQuickStart(false)}
          footer={null}
          width={900}
          centered
        >
          <QuickStartGuide onClose={() => setShowQuickStart(false)} />
        </Modal>
      )}

      <TestCaseCreationGuide
        visible={showCreationGuide}
        onClose={() => setShowCreationGuide(false)}
      />

      {showAnalytics && <TestCaseAnalytics testCases={testCases} />}

      <Card className="shadow-lg">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
        >
          <TabPane
            tab={renderTabLabel("Tạo nhanh", <ThunderboltOutlined />, 0)}
            key="quick"
          >
            <div className="space-y-4">
              <Alert
                message="🚀 Hệ thống tạo Test Case thông minh"
                description={
                  <div className="space-y-2">
                    <p>
                      Sử dụng các công cụ thông minh để tạo test cases chuyên
                      nghiệp:
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Templates:</strong> Mẫu có sẵn cho các thuật
                        toán phổ biến
                      </li>
                      <li>
                        <strong>Bulk Input:</strong> Nhập hàng loạt với phát
                        hiện kiểu dữ liệu tự động
                      </li>
                      <li>
                        <strong>CSV Import:</strong> Import từ file CSV với xử
                        lý thông minh
                      </li>
                      <li>
                        <strong>Auto-complete:</strong> Tự động tạo cấu trúc
                        JSON hoàn chỉnh
                      </li>
                    </ul>
                    <div className="text-sm text-blue-600 mt-2">
                      💡 Tất cả test cases được tạo sẽ có đầy đủ thuộc tính cần
                      thiết và sẵn sàng để chỉnh sửa thủ công.
                    </div>
                  </div>
                }
                type="info"
                showIcon
              />

              <TestCaseQuickInput
                onTestCasesGenerated={handleQuickGenerate}
                problemType="advanced"
              />
            </div>
          </TabPane>

          <TabPane
            tab={renderTabLabel("AI Generation", <RobotOutlined />, 0)}
            key="ai"
          >
            <AITestCaseGenerationTab
              problemTitle={form.getFieldValue("title")}
              problemDescription={form.getFieldValue("description")}
              constraints={form.getFieldValue("constraints")}
              onTestCasesGenerated={handleQuickGenerate}
              disabled={false}
              functionSignatures={{
                java: form.getFieldValue("javaSignature"),
                python: form.getFieldValue("pythonSignature"),
                cpp: form.getFieldValue("cppSignature"),
                javascript: form.getFieldValue("javascriptSignature"),
              }}
            />
          </TabPane>

          <TabPane
            tab={renderTabLabel("Templates nâng cao", <RocketOutlined />, 0)}
            key="advanced"
          >
            <div className="space-y-4">
              <Alert
                message="🎯 Templates thuật toán chuyên nghiệp"
                description="Chọn từ các mẫu thuật toán nâng cao với test cases được tối ưu hóa và cài đặt hiệu năng"
                type="info"
                showIcon
              />

              <AdvancedPatternTemplates
                onTemplateApply={handleAdvancedTemplate}
              />
            </div>
          </TabPane>

          <TabPane
            tab={renderTabLabel(
              "Chỉnh sửa thủ công",
              <EditOutlined />,
              testCases.length
            )}
            key="manual"
          >
            <div className="space-y-4">
              <Alert
                message="✏️ Trình chỉnh sửa Test Case thủ công - Chuyên nghiệp"
                description={
                  <div className="space-y-2">
                    <p>Chỉnh sửa test cases với các tính năng thông minh:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Validation thời gian thực:</strong> Kiểm tra lỗi
                        ngay khi nhập
                      </li>
                      <li>
                        <strong>Auto-fix JSON:</strong> Tự động sửa lỗi định
                        dạng JSON
                      </li>
                      <li>
                        <strong>Smart suggestions:</strong> Gợi ý cải thiện test
                        cases
                      </li>
                      <li>
                        <strong>Complete structure:</strong> Đầy đủ tất cả thuộc
                        tính cần thiết
                      </li>
                      <li>
                        <strong>Data type selection:</strong> Chọn kiểu dữ liệu
                        chính xác
                      </li>
                    </ul>
                    <div className="text-sm text-green-600 mt-2">
                      ✅ Tất cả test cases từ templates, bulk input, CSV sẽ hiển
                      thị ở đây để chỉnh sửa.
                    </div>
                  </div>
                }
                type="info"
                showIcon
              />

              <EnhancedTestCaseForm
                key={refreshKey}
                form={form}
                onTestCasesChange={handleTestCasesUpdate}
              />
            </div>
          </TabPane>

          <TabPane
            tab={renderTabLabel("Thao tác hàng loạt", <AppstoreOutlined />, 0)}
            key="batch"
          >
            <div className="space-y-4">
              <Alert
                message="🔧 Thao tác hàng loạt"
                description="Thực hiện các thao tác hàng loạt trên nhiều test cases: chỉnh sửa, nhân bản, xóa, import/export"
                type="info"
                showIcon
              />

              <BatchTestCaseOperations
                testCases={testCases}
                onTestCasesUpdate={handleTestCasesUpdate}
              />
            </div>
          </TabPane>

          <TabPane
            tab={renderTabLabel("Phân tích", <BarChartOutlined />, 0)}
            key="analytics"
          >
            <div className="space-y-4">
              <Alert
                message="📊 Phân tích Test Case"
                description="Phân tích chất lượng, độ bao phủ, độ phức tạp của test cases và nhận gợi ý cải thiện"
                type="info"
                showIcon
              />

              <TestCaseAnalytics testCases={testCases} />
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Quick Actions Floating Panel */}
      {testCases.length > 0 && (
        <Card
          size="small"
          className="fixed bottom-4 right-4 shadow-lg z-50"
          style={{ width: 300 }}
        >
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Thao tác nhanh</div>
            <Space>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                {showAnalytics ? "Ẩn" : "Hiện"} Phân tích
              </Button>

              <Button
                size="small"
                icon={<AppstoreOutlined />}
                onClick={() => setActiveTab("batch")}
              >
                Hàng loạt
              </Button>

              <Button
                size="small"
                icon={<RobotOutlined />}
                onClick={() => setActiveTab("ai")}
                type="primary"
              >
                AI
              </Button>

              <Button
                size="small"
                icon={<ThunderboltOutlined />}
                onClick={() => setActiveTab("quick")}
              >
                Thêm nhanh
              </Button>

              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={switchToManualTab}
                type={activeTab === "manual" ? "primary" : "default"}
              >
                Chỉnh sửa
              </Button>
            </Space>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SuperchargedTestCaseManager;
