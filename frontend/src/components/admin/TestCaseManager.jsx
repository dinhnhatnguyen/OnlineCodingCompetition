import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  message,
  Tooltip,
  Space,
  Popconfirm,
  Typography,
  Card,
  Tabs,
  Alert,
  Dropdown,
  Menu,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import * as testCaseApi from "../../api/testCaseApi";
import {
  validateValueByType,
  getExampleValueByType,
} from "../../utils/dataTypeValidator";
import BulkEditModal from "./BulkEditModal";
import { useToast } from "../../contexts/ToastContext";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

// Kiểu dữ liệu hỗ trợ
const DATA_TYPES = {
  java: {
    array: "int[], Integer[], String[], boolean[], char[], long[], double[]",
    string: "String",
    integer: "int, long, Integer, Long, short, byte",
    float: "float, double, Float, Double",
    boolean: "boolean, Boolean",
    object: "Object, Map<K,V>, HashMap<K,V>, List<E>, ArrayList<E>, Set<E>",
    custom: "YourClassName",
  },
  python: {
    array: "List[int], List[str], List[bool], List[float], tuple, set",
    string: "str",
    integer: "int",
    float: "float",
    boolean: "bool",
    object: "dict, object, Dict[K,V], collections.defaultdict",
    custom: "YourClassName",
  },
  javascript: {
    array: "Array<number>, Array<string>, Array<boolean>",
    string: "string",
    integer: "number",
    float: "number",
    boolean: "boolean",
    object: "object, Map, Set",
    custom: "YourClassName",
  },
  cpp: {
    array: "int[], vector<int>, vector<string>",
    string: "string, char*",
    integer: "int, long, short",
    float: "float, double",
    boolean: "bool",
    object: "struct, class, map<K,V>, vector<T>",
    custom: "YourClassName",
  },
};

const TestCaseManager = ({ problemId, token, onTestCasesChanged }) => {
  const [form] = Form.useForm();
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState(null);
  const [activeTab, setActiveTab] = useState("1");

  // Bulk operations state
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [bulkEditModalVisible, setBulkEditModalVisible] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  // Toast notifications
  const { showSuccess, showError, showInfo } = useToast();

  // Get example value based on type
  const getExampleValue = (type) => {
    return getExampleValueByType(type);
  };

  // Tải danh sách test cases
  useEffect(() => {
    if (problemId) {
      fetchTestCases();
    }
  }, [problemId]);

  const fetchTestCases = async () => {
    try {
      setLoading(true);
      const testCasesData = await testCaseApi.getTestCasesByProblemId(
        problemId
      );
      setTestCases(testCasesData);
    } catch (error) {
      showError("Không thể tải test cases: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateInputData = (fields) => {
    const inputs = fields.map((field) => ({
      input: form.getFieldValue([field.name, "value"]),
      dataType: form.getFieldValue([field.name, "type"]),
    }));
    form.setFieldValue("inputData", JSON.stringify(inputs));
  };

  // Bulk operations handlers
  const handleRowSelectionChange = (selectedKeys) => {
    setSelectedRowKeys(selectedKeys);
  };

  const handleClearSelection = () => {
    setSelectedRowKeys([]);
  };

  const handleBulkEdit = () => {
    setBulkEditModalVisible(true);
  };

  const handleBulkDelete = () => {
    Modal.confirm({
      title: "Xác nhận xóa hàng loạt",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} test cases đã chọn không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setBulkLoading(true);
          // Delete selected test cases
          for (const id of selectedRowKeys) {
            await testCaseApi.deleteTestCase(id, token);
          }
          await fetchTestCases();
          setSelectedRowKeys([]);
          showSuccess(
            `Đã xóa ${selectedRowKeys.length} test cases thành công!`
          );
        } catch (error) {
          showError("Có lỗi xảy ra khi xóa test cases: " + error.message);
        } finally {
          setBulkLoading(false);
        }
      },
    });
  };

  const handleBulkDuplicate = async () => {
    try {
      setBulkLoading(true);
      const selectedTestCases = testCases.filter((tc) =>
        selectedRowKeys.includes(tc.id)
      );

      for (const testCase of selectedTestCases) {
        const duplicatedTestCase = {
          ...testCase,
          id: undefined, // Remove ID to create new
          description: `${testCase.description} (Bản sao)`,
          testOrder: testCases.length + 1,
        };
        await testCaseApi.createTestCase(duplicatedTestCase, token);
      }

      await fetchTestCases();
      setSelectedRowKeys([]);
      showSuccess(
        `Đã sao chép ${selectedTestCases.length} test cases thành công!`
      );
    } catch (error) {
      showError("Có lỗi xảy ra khi sao chép test cases: " + error.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkEditSubmit = async (updates) => {
    try {
      setBulkLoading(true);

      const request = {
        testCaseIds: selectedRowKeys,
        updates: updates,
        operation: "UPDATE",
      };

      await testCaseApi.batchUpdateTestCases(problemId, request, token);
      await fetchTestCases();
      setSelectedRowKeys([]);
      setBulkEditModalVisible(false);

      showSuccess(
        `Đã cập nhật ${selectedRowKeys.length} test cases thành công!`
      );
    } catch (error) {
      showError("Có lỗi xảy ra khi cập nhật test cases: " + error.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const updateOutputData = () => {
    const outputType = form.getFieldValue(["output", "type"]);
    const outputValue = form.getFieldValue(["output", "value"]);
    if (outputType && outputValue) {
      form.setFieldValue(
        "expectedOutputData",
        JSON.stringify({
          expectedOutput: outputValue,
          dataType: outputType,
        })
      );
    }
  };

  const showModal = (testCase = null) => {
    form.resetFields();

    if (testCase) {
      setEditingTestCase(testCase);
      try {
        // Parse input data
        const inputs = JSON.parse(testCase.inputData);
        form.setFieldValue(
          "inputs",
          inputs.map((input) => ({
            type: input.dataType,
            value: input.input,
          }))
        );

        // Parse output data
        const output = JSON.parse(testCase.expectedOutputData);
        form.setFieldValue("output", {
          type: output.dataType,
          value: output.expectedOutput,
        });

        // Set other fields
        form.setFieldsValue({
          description: testCase.description,
          isExample: testCase.isExample || false,
          isHidden: testCase.isHidden || false,
          timeLimit: testCase.timeLimit || 1000,
          memoryLimit: testCase.memoryLimit || 262144,
          weight: testCase.weight || 1.0,
          testOrder: testCase.testOrder || 0,
          comparisonMode: testCase.comparisonMode || "EXACT",
          epsilon: testCase.epsilon,
        });
      } catch (error) {
        console.error("Error parsing test case data:", error);
        message.error("Lỗi khi tải dữ liệu test case");
      }
    } else {
      setEditingTestCase(null);
      form.setFieldsValue({
        inputs: [{ type: undefined, value: undefined }],
        output: { type: undefined, value: undefined },
        isExample: false,
        isHidden: false,
        timeLimit: 1000,
        memoryLimit: 262144,
        weight: 1.0,
        testOrder: testCases.length,
        comparisonMode: "EXACT",
      });
    }

    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Prepare input data
      const inputData = values.inputs.map((input) => ({
        input: input.value,
        dataType: input.type,
      }));

      // Prepare output data
      const outputData = {
        expectedOutput: values.output.value,
        dataType: values.output.type,
      };

      const testCaseData = {
        ...values,
        inputData: JSON.stringify(inputData),
        expectedOutputData: JSON.stringify(outputData),
        problemId,
      };

      // Remove temporary form fields
      delete testCaseData.inputs;
      delete testCaseData.output;

      if (editingTestCase) {
        await testCaseApi.updateTestCase(
          editingTestCase.id,
          testCaseData,
          token
        );
        message.success({
          content: "Test case đã được cập nhật thành công!",
          duration: 5,
          style: {
            marginTop: "20vh",
          },
        });
      } else {
        await testCaseApi.createTestCase(testCaseData, token);
        message.success({
          content: "Test case mới đã được tạo thành công!",
          duration: 5,
          style: {
            marginTop: "20vh",
          },
        });
      }

      setModalVisible(false);
      fetchTestCases();
      if (onTestCasesChanged) {
        onTestCasesChanged();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error({
        content: "Lỗi: " + (error.response?.data?.message || error.message),
        duration: 5,
        style: {
          marginTop: "20vh",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await testCaseApi.deleteTestCase(id, token);
      message.success({
        content: "Test case đã được xóa thành công!",
        duration: 5,
        style: {
          marginTop: "20vh",
        },
      });
      fetchTestCases();
      if (onTestCasesChanged) {
        onTestCasesChanged();
      }
    } catch (error) {
      message.error({
        content: "Không thể xóa test case: " + error.message,
        duration: 5,
        style: {
          marginTop: "20vh",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = (testCase) => {
    const duplicatedTestCase = {
      ...testCase,
      id: null,
      description: `Copy of ${testCase.description}`,
      testOrder: testCases.length,
    };

    showModal(duplicatedTestCase);
  };

  // Cột cho bảng test cases
  const columns = [
    {
      title: "#",
      dataIndex: "testOrder",
      key: "testOrder",
      width: 60,
      sorter: (a, b) => a.testOrder - b.testOrder,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Kiểu",
      key: "type",
      width: 100,
      render: (_, record) => (
        <span>
          {record.isExample ? <span className="tag-example">Ví dụ</span> : null}
          {record.isHidden ? <span className="tag-hidden">Ẩn</span> : null}
        </span>
      ),
    },
    {
      title: "Giới hạn",
      key: "limits",
      width: 180,
      render: (_, record) => (
        <>
          <div>Thời gian: {record.timeLimit}ms</div>
          <div>Bộ nhớ: {(record.memoryLimit / 1024).toFixed(1)}MB</div>
        </>
      ),
    },
    {
      title: "Điểm",
      dataIndex: "weight",
      key: "weight",
      width: 80,
      sorter: (a, b) => a.weight - b.weight,
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: "edit",
                icon: <EditOutlined />,
                label: "Sửa",
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  showModal(record);
                },
              },
              {
                key: "duplicate",
                icon: <CopyOutlined />,
                label: "Sao chép",
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  handleDuplicate(record);
                },
              },
              {
                key: "delete",
                icon: <DeleteOutlined />,
                label: "Xóa",
                danger: true,
                onClick: (e) => {
                  e.domEvent.stopPropagation();
                  Modal.confirm({
                    title: "Xác nhận xóa",
                    icon: <ExclamationCircleOutlined />,
                    content: "Bạn có chắc chắn muốn xóa test case này không?",
                    okText: "Xóa",
                    okType: "danger",
                    cancelText: "Hủy",
                    onOk: () => handleDelete(record.id),
                  });
                },
              },
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            className="border border-gray-300 hover:border-blue-500"
          />
        </Dropdown>
      ),
    },
  ];

  const TestCaseInputForm = ({ form, field }) => {
    const [inputCount, setInputCount] = useState(1);

    const handleAddInput = () => {
      setInputCount((prev) => prev + 1);
    };

    const handleRemoveInput = (index) => {
      setInputCount((prev) => prev - 1);
      // Remove the input from form
      const currentInputs = form.getFieldValue([field.name, "inputs"]) || [];
      currentInputs.splice(index, 1);
      form.setFieldValue([field.name, "inputs"], currentInputs);
      updateInputData();
    };

    const updateInputData = () => {
      const inputs = form.getFieldValue([field.name, "inputs"]) || [];
      const inputData = inputs.map((input) => ({
        input: input.value,
        dataType: input.type,
      }));
      form.setFieldValue([field.name, "inputData"], JSON.stringify(inputData));
    };

    return (
      <div className="space-y-4">
        {Array.from({ length: inputCount }).map((_, index) => (
          <div key={index} className="flex items-center gap-2">
            <Form.Item
              className="flex-1 mb-0"
              name={[field.name, "inputs", index, "type"]}
              rules={[
                { required: true, message: "Vui lòng chọn kiểu dữ liệu" },
              ]}
            >
              <Select
                placeholder="Chọn kiểu dữ liệu"
                onChange={(value) => {
                  // Set example value when type changes
                  form.setFieldValue(
                    [field.name, "inputs", index, "value"],
                    getExampleValue(value)
                  );
                  updateInputData();
                }}
              >
                {Object.entries(DATA_TYPES.java).map(([key, types]) => (
                  <Select.OptGroup key={key} label={key.toUpperCase()}>
                    {types.split(", ").map((type) => (
                      <Option key={`${key}-${type}`} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select.OptGroup>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              className="flex-1 mb-0"
              name={[field.name, "inputs", index, "value"]}
              rules={[
                { required: true, message: "Vui lòng nhập giá trị" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const type = getFieldValue([
                      field.name,
                      "inputs",
                      index,
                      "type",
                    ]);
                    if (!type || !value) return Promise.resolve();

                    const validation = validateValueByType(value, type);
                    if (!validation.isValid) {
                      return Promise.reject(new Error(validation.message));
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input
                placeholder="Nhập giá trị"
                onChange={() => updateInputData()}
              />
            </Form.Item>
            {index === inputCount - 1 ? (
              <Button
                type="dashed"
                onClick={handleAddInput}
                icon={<PlusOutlined />}
              >
                Thêm
              </Button>
            ) : (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemoveInput(index)}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: handleRowSelectionChange,
    getCheckboxProps: (record) => ({
      disabled: false,
      name: record.id,
    }),
  };

  return (
    <div className="test-case-manager">
      <div className="header-actions mb-4 flex justify-between items-center">
        <Title level={4}>Quản lý Test Cases</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Thêm Test Case
        </Button>
      </div>

      {/* Bulk Operations Toolbar */}
      {selectedRowKeys.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              <span className="text-blue-700 font-medium">
                Đã chọn {selectedRowKeys.length} test case
                {selectedRowKeys.length > 1 ? "s" : ""}
              </span>
              <Button
                size="small"
                onClick={handleClearSelection}
                className="text-blue-600 hover:text-blue-800 border-blue-300 hover:border-blue-400"
              >
                Bỏ chọn tất cả
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleBulkEdit}
                loading={bulkLoading}
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Chỉnh sửa hàng loạt</span>
                <span className="sm:hidden">Chỉnh sửa</span>
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={handleBulkDuplicate}
                loading={bulkLoading}
                className="flex-1 sm:flex-none"
              >
                Sao chép
              </Button>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={handleBulkDelete}
                loading={bulkLoading}
                className="flex-1 sm:flex-none"
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}

      <Table
        columns={columns}
        dataSource={testCases}
        rowKey="id"
        loading={loading || bulkLoading}
        pagination={{ pageSize: 10 }}
        bordered
        size="middle"
        rowSelection={rowSelection}
      />

      <Modal
        title={editingTestCase ? "Chỉnh sửa Test Case" : "Thêm mới Test Case"}
        open={modalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleSubmit}
          >
            {editingTestCase ? "Cập nhật" : "Tạo mới"}
          </Button>,
        ]}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isExample: false,
            isHidden: false,
            timeLimit: 1000,
            memoryLimit: 262144,
            weight: 1.0,
            comparisonMode: "EXACT",
          }}
        >
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Dữ liệu" key="1">
              <Card title="Dữ liệu đầu vào" className="mb-4">
                <Form.List name="inputs">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <div
                          key={field.key}
                          className="flex items-center gap-2 mb-4"
                        >
                          <Form.Item
                            className="flex-1 mb-0"
                            name={[field.name, "type"]}
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn kiểu dữ liệu",
                              },
                            ]}
                          >
                            <Select
                              placeholder="Chọn kiểu dữ liệu"
                              onChange={(value) => {
                                form.setFieldValue(
                                  [field.name, "value"],
                                  getExampleValue(value)
                                );
                                updateInputData(fields);
                              }}
                            >
                              {Object.entries(DATA_TYPES.java).map(
                                ([key, types]) => (
                                  <Select.OptGroup
                                    key={key}
                                    label={key.toUpperCase()}
                                  >
                                    {types.split(", ").map((type) => (
                                      <Option
                                        key={`${key}-${type}`}
                                        value={type}
                                      >
                                        {type}
                                      </Option>
                                    ))}
                                  </Select.OptGroup>
                                )
                              )}
                            </Select>
                          </Form.Item>
                          <Form.Item
                            className="flex-1 mb-0"
                            name={[field.name, "value"]}
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập giá trị",
                              },
                            ]}
                          >
                            <Input
                              placeholder="Nhập giá trị"
                              onChange={() => updateInputData(fields)}
                            />
                          </Form.Item>
                          {fields.length > 1 && (
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => {
                                remove(field.name);
                                updateInputData(
                                  fields.filter((_, i) => i !== index)
                                );
                              }}
                            />
                          )}
                        </div>
                      ))}
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        Thêm tham số
                      </Button>
                    </>
                  )}
                </Form.List>
              </Card>

              <Card title="Kết quả mong đợi">
                <div className="flex items-center gap-2">
                  <Form.Item
                    name={["output", "type"]}
                    className="flex-1 mb-0"
                    rules={[
                      { required: true, message: "Vui lòng chọn kiểu dữ liệu" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn kiểu dữ liệu"
                      onChange={(value) => {
                        form.setFieldValue(
                          ["output", "value"],
                          getExampleValue(value)
                        );
                        updateOutputData();
                      }}
                    >
                      {Object.entries(DATA_TYPES.java).map(([key, types]) => (
                        <Select.OptGroup key={key} label={key.toUpperCase()}>
                          {types.split(", ").map((type) => (
                            <Option key={`${key}-${type}`} value={type}>
                              {type}
                            </Option>
                          ))}
                        </Select.OptGroup>
                      ))}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name={["output", "value"]}
                    className="flex-1 mb-0"
                    rules={[
                      { required: true, message: "Vui lòng nhập giá trị" },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const type = getFieldValue(["output", "type"]);
                          if (!type || !value) return Promise.resolve();

                          const validation = validateValueByType(value, type);
                          if (!validation.isValid) {
                            return Promise.reject(
                              new Error(validation.message)
                            );
                          }
                          return Promise.resolve();
                        },
                      }),
                    ]}
                  >
                    <Input
                      placeholder="Nhập giá trị"
                      onChange={() => updateOutputData()}
                    />
                  </Form.Item>
                </div>
              </Card>
            </TabPane>
            <TabPane tab="Cài đặt" key="2">
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  {
                    required: true,
                    message: "Mô tả là bắt buộc",
                  },
                ]}
              >
                <Input placeholder="Ví dụ: Test với mảng số nguyên khác nhau" />
              </Form.Item>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Form.Item
                  name="timeLimit"
                  label={
                    <span>
                      Giới hạn thời gian (ms)
                      <Tooltip title="Thời gian thực thi tối đa được phép">
                        <InfoCircleOutlined className="ml-1 text-gray-400" />
                      </Tooltip>
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Giới hạn thời gian là bắt buộc",
                    },
                  ]}
                >
                  <InputNumber min={100} max={10000} className="w-full" />
                </Form.Item>

                <Form.Item
                  name="memoryLimit"
                  label={
                    <span>
                      Giới hạn bộ nhớ (KB)
                      <Tooltip title="Bộ nhớ tối đa được phép sử dụng">
                        <InfoCircleOutlined className="ml-1 text-gray-400" />
                      </Tooltip>
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Giới hạn bộ nhớ là bắt buộc",
                    },
                  ]}
                >
                  <InputNumber min={1024} max={1048576} className="w-full" />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Form.Item
                  name="weight"
                  label={
                    <span>
                      Điểm số
                      <Tooltip title="Điểm số cho test case này">
                        <InfoCircleOutlined className="ml-1 text-gray-400" />
                      </Tooltip>
                    </span>
                  }
                >
                  <InputNumber
                    min={0}
                    max={100}
                    step={0.1}
                    className="w-full"
                  />
                </Form.Item>

                <Form.Item
                  name="testOrder"
                  label={
                    <span>
                      Thứ tự test
                      <Tooltip title="Thứ tự chạy test case">
                        <InfoCircleOutlined className="ml-1 text-gray-400" />
                      </Tooltip>
                    </span>
                  }
                >
                  <InputNumber min={0} className="w-full" />
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Form.Item
                  name="comparisonMode"
                  label={
                    <span>
                      Chế độ so sánh
                      <Tooltip title="Cách so sánh kết quả">
                        <InfoCircleOutlined className="ml-1 text-gray-400" />
                      </Tooltip>
                    </span>
                  }
                >
                  <Select>
                    <Option value="EXACT">Chính xác</Option>
                    <Option value="IGNORE_WHITESPACE">
                      Bỏ qua khoảng trắng
                    </Option>
                    <Option value="FLOAT">Số thực (dùng epsilon)</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.comparisonMode !== currentValues.comparisonMode
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue("comparisonMode") === "FLOAT" ? (
                      <Form.Item
                        name="epsilon"
                        label={
                          <span>
                            Epsilon
                            <Tooltip title="Độ chênh lệch cho phép giữa kết quả">
                              <InfoCircleOutlined className="ml-1 text-gray-400" />
                            </Tooltip>
                          </span>
                        }
                      >
                        <InputNumber
                          min={0.000001}
                          max={1}
                          step={0.000001}
                          defaultValue={0.000001}
                          className="w-full"
                        />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Form.Item
                  name="isExample"
                  valuePropName="checked"
                  label={
                    <span>
                      Là ví dụ
                      <Tooltip title="Test case này sẽ được hiển thị như là một ví dụ trong đề bài">
                        <InfoCircleOutlined className="ml-1 text-gray-400" />
                      </Tooltip>
                    </span>
                  }
                >
                  <Switch />
                </Form.Item>

                <Form.Item
                  name="isHidden"
                  valuePropName="checked"
                  label={
                    <span>
                      Ẩn test case
                      <Tooltip title="Test case này sẽ không hiển thị cho người dùng">
                        <InfoCircleOutlined className="ml-1 text-gray-400" />
                      </Tooltip>
                    </span>
                  }
                >
                  <Switch />
                </Form.Item>
              </div>
            </TabPane>
          </Tabs>
        </Form>
      </Modal>

      {/* Bulk Edit Modal */}
      <BulkEditModal
        visible={bulkEditModalVisible}
        onCancel={() => setBulkEditModalVisible(false)}
        onOk={handleBulkEditSubmit}
        selectedCount={selectedRowKeys.length}
        loading={bulkLoading}
      />
    </div>
  );
};

export default TestCaseManager;
