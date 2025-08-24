import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Checkbox,
  Modal,
  Form,
  InputNumber,
  Switch,
  message,
  Alert,
  Divider,
  Upload,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  SelectOutlined,
} from "@ant-design/icons";

const BatchTestCaseOperations = ({ testCases, onTestCasesUpdate }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [batchEditVisible, setBatchEditVisible] = useState(false);
  const [batchEditForm] = Form.useForm();

  const columns = [
    {
      title: "#",
      dataIndex: "testOrder",
      key: "testOrder",
      width: 50,
      render: (text, record, index) => index + 1,
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
          {record.isExample && <span className="text-blue-600">Example</span>}
          {record.isHidden && <span className="text-orange-600">Hidden</span>}
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

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    onSelectAll: (selected, selectedRows, changeRows) => {
      if (selected) {
        setSelectedRowKeys(testCases.map((_, index) => index));
      } else {
        setSelectedRowKeys([]);
      }
    },
  };

  const handleBatchEdit = async () => {
    try {
      const values = await batchEditForm.validateFields();
      const updatedTestCases = [...testCases];

      selectedRowKeys.forEach((index) => {
        if (values.timeLimit !== undefined) {
          updatedTestCases[index].timeLimit = values.timeLimit;
        }
        if (values.memoryLimit !== undefined) {
          updatedTestCases[index].memoryLimit = values.memoryLimit;
        }
        if (values.weight !== undefined) {
          updatedTestCases[index].weight = values.weight;
        }
        if (values.isExample !== undefined) {
          updatedTestCases[index].isExample = values.isExample;
        }
        if (values.isHidden !== undefined) {
          updatedTestCases[index].isHidden = values.isHidden;
        }
      });

      onTestCasesUpdate(updatedTestCases);
      setBatchEditVisible(false);
      batchEditForm.resetFields();
      setSelectedRowKeys([]);
      message.success(`Updated ${selectedRowKeys.length} test cases!`);
    } catch (error) {
      message.error("Please check your input values");
    }
  };

  const handleBatchDelete = () => {
    Modal.confirm({
      title: "Delete Selected Test Cases",
      content: `Are you sure you want to delete ${selectedRowKeys.length} test cases?`,
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        const updatedTestCases = testCases.filter(
          (_, index) => !selectedRowKeys.includes(index)
        );
        // Update test orders
        const reorderedTestCases = updatedTestCases.map((tc, i) => ({
          ...tc,
          testOrder: i + 1,
        }));
        onTestCasesUpdate(reorderedTestCases);
        setSelectedRowKeys([]);
        message.success(`Deleted ${selectedRowKeys.length} test cases!`);
      },
    });
  };

  const handleBatchDuplicate = () => {
    const selectedTestCases = selectedRowKeys.map((index) => ({
      ...testCases[index],
      description: `${testCases[index].description} (Copy)`,
    }));

    const updatedTestCases = [...testCases, ...selectedTestCases];
    // Update test orders
    const reorderedTestCases = updatedTestCases.map((tc, i) => ({
      ...tc,
      testOrder: i + 1,
    }));

    onTestCasesUpdate(reorderedTestCases);
    setSelectedRowKeys([]);
    message.success(`Duplicated ${selectedRowKeys.length} test cases!`);
  };

  const handleExport = () => {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalTestCases: testCases.length,
        version: "1.0",
      },
      testCases: testCases,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `test-cases-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    message.success("Test cases exported successfully!");
  };

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        let importedTestCases = [];

        if (importData.testCases && Array.isArray(importData.testCases)) {
          importedTestCases = importData.testCases;
        } else if (Array.isArray(importData)) {
          importedTestCases = importData;
        } else {
          throw new Error("Invalid file format");
        }

        // Merge with existing test cases
        const updatedTestCases = [...testCases, ...importedTestCases];
        // Update test orders
        const reorderedTestCases = updatedTestCases.map((tc, i) => ({
          ...tc,
          testOrder: i + 1,
        }));

        onTestCasesUpdate(reorderedTestCases);
        message.success(`Imported ${importedTestCases.length} test cases!`);
      } catch (error) {
        message.error("Failed to import file. Please check the format.");
      }
    };
    reader.readAsText(file);
    return false; // Prevent upload
  };

  const selectAll = () => {
    setSelectedRowKeys(testCases.map((_, index) => index));
  };

  const clearSelection = () => {
    setSelectedRowKeys([]);
  };

  if (testCases.length === 0) {
    return (
      <Alert
        message="No test cases available"
        description="Create some test cases first to use batch operations"
        type="info"
        showIcon
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card title="📋 Test Case List">
        <div className="mb-4">
          <Space>
            <Button
              icon={<SelectOutlined />}
              onClick={selectAll}
              disabled={selectedRowKeys.length === testCases.length}
            >
              Select All
            </Button>
            <Button onClick={clearSelection} disabled={selectedRowKeys.length === 0}>
              Clear Selection
            </Button>
            <span className="text-gray-500">
              {selectedRowKeys.length} of {testCases.length} selected
            </span>
          </Space>
        </div>

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={testCases}
          rowKey={(record, index) => index}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      <Card title="🔧 Batch Operations">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button
            icon={<EditOutlined />}
            onClick={() => setBatchEditVisible(true)}
            disabled={selectedRowKeys.length === 0}
            block
          >
            Batch Edit
          </Button>

          <Button
            icon={<CopyOutlined />}
            onClick={handleBatchDuplicate}
            disabled={selectedRowKeys.length === 0}
            block
          >
            Duplicate
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
            block
          >
            Delete
          </Button>

          <Button icon={<DownloadOutlined />} onClick={handleExport} block>
            Export All
          </Button>
        </div>

        <Divider />

        <div className="flex justify-center">
          <Upload
            accept=".json"
            beforeUpload={handleImport}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Import JSON</Button>
          </Upload>
        </div>
      </Card>

      <Modal
        title="Batch Edit Test Cases"
        open={batchEditVisible}
        onCancel={() => setBatchEditVisible(false)}
        onOk={handleBatchEdit}
        width={600}
      >
        <Alert
          message={`Editing ${selectedRowKeys.length} test cases`}
          description="Only fill the fields you want to update. Empty fields will be ignored."
          type="info"
          showIcon
          className="mb-4"
        />

        <Form form={batchEditForm} layout="vertical">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="timeLimit" label="Time Limit (ms)">
              <InputNumber min={100} max={10000} className="w-full" />
            </Form.Item>

            <Form.Item name="memoryLimit" label="Memory Limit (KB)">
              <InputNumber min={1024} max={1048576} className="w-full" />
            </Form.Item>
          </div>

          <Form.Item name="weight" label="Weight">
            <InputNumber min={0.1} max={10} step={0.1} className="w-full" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="isExample" label="Mark as Example" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="isHidden" label="Mark as Hidden" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BatchTestCaseOperations;
