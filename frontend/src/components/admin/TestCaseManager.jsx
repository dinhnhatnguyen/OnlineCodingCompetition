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
} from "@ant-design/icons";
import * as testCaseApi from "../../api/testCaseApi";

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
  const [selectedInputType, setSelectedInputType] = useState("array");
  const [selectedOutputType, setSelectedOutputType] = useState("array");
  const [activeTab, setActiveTab] = useState("1");

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
      message.error("Không thể tải test cases: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Thêm test case mẫu
  const insertTestCaseExample = (type) => {
    if (type === "input") {
      form.setFieldsValue({
        inputData: JSON.stringify(
          [
            { input: "[1, 2, 3, 4, 5]", dataType: "int[]" },
            { input: "10", dataType: "int" },
          ],
          null,
          2
        ),
      });
    } else if (type === "output") {
      form.setFieldsValue({
        expectedOutputData: JSON.stringify(
          {
            expectedOutput: "15",
            dataType: "int",
          },
          null,
          2
        ),
      });
    }
  };

  // Xác thực dữ liệu đầu vào
  const validateInputData = (_, value) => {
    try {
      if (!value)
        return Promise.reject(new Error("Dữ liệu đầu vào là bắt buộc"));

      const parsed = JSON.parse(value);

      // Kiểm tra nếu đó là một mảng cho nhiều tham số
      if (!Array.isArray(parsed)) {
        return Promise.reject(
          new Error("Dữ liệu đầu vào phải là một mảng các đối tượng")
        );
      }

      // Kiểm tra từng đối tượng tham số
      for (const param of parsed) {
        if (!param.input || !param.dataType) {
          return Promise.reject(
            new Error("Mỗi tham số phải có 'input' và 'dataType'")
          );
        }
      }

      return Promise.resolve();
    } catch {
      return Promise.reject(new Error("Định dạng JSON không hợp lệ"));
    }
  };

  // Xác thực dữ liệu đầu ra
  const validateOutputData = (_, value) => {
    try {
      if (!value)
        return Promise.reject(new Error("Dữ liệu đầu ra là bắt buộc"));

      const parsed = JSON.parse(value);

      // Kiểm tra cấu trúc của kết quả đầu ra
      if (!parsed.expectedOutput || !parsed.dataType) {
        return Promise.reject(
          new Error("Dữ liệu đầu ra phải có 'expectedOutput' và 'dataType'")
        );
      }

      return Promise.resolve();
    } catch {
      return Promise.reject(new Error("Định dạng JSON không hợp lệ"));
    }
  };

  const showModal = (testCase = null) => {
    form.resetFields();

    if (testCase) {
      setEditingTestCase(testCase);
      form.setFieldsValue({
        ...testCase,
        isExample: testCase.isExample || false,
        isHidden: testCase.isHidden || false,
        timeLimit: testCase.timeLimit || 1000,
        memoryLimit: testCase.memoryLimit || 262144,
        weight: testCase.weight || 1.0,
        testOrder: testCase.testOrder || 0,
      });
      setSelectedInputType(testCase.inputType || "array");
      setSelectedOutputType(testCase.outputType || "array");
    } else {
      setEditingTestCase(null);
      form.setFieldsValue({
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

      const testCaseData = {
        ...values,
        problemId,
      };

      if (editingTestCase) {
        await testCaseApi.updateTestCase(
          editingTestCase.id,
          testCaseData,
          token
        );
        message.success("Test case cập nhật thành công!");
      } else {
        await testCaseApi.createTestCase(testCaseData, token);
        message.success("Test case tạo thành công!");
      }

      setModalVisible(false);
      fetchTestCases();
      if (onTestCasesChanged) {
        onTestCasesChanged();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error("Lỗi: " + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await testCaseApi.deleteTestCase(id, token);
      message.success("Test case xóa thành công!");
      fetchTestCases();
      if (onTestCasesChanged) {
        onTestCasesChanged();
      }
    } catch (error) {
      message.error("Không thể xóa test case: " + error.message);
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

      <Table
        columns={columns}
        dataSource={testCases}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
        size="middle"
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
                <Form.Item name="inputType" label="Loại dữ liệu đầu vào">
                  <Select
                    onChange={(value) => setSelectedInputType(value)}
                    placeholder="Chọn kiểu dữ liệu đầu vào"
                  >
                    <Option value="array">Mảng</Option>
                    <Option value="string">Chuỗi</Option>
                    <Option value="integer">Số nguyên</Option>
                    <Option value="object">Đối tượng</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="inputData"
                  label={
                    <div className="flex items-center">
                      Dữ liệu đầu vào (JSON)
                      <Tooltip
                        title={
                          <div>
                            <p>
                              <strong>Định dạng mẫu:</strong>{" "}
                              <code>
                                [
                                {`{"input":"giá_trị","dataType":"kiểu_dữ_liệu"}`}
                                ]
                              </code>
                            </p>
                            <p>
                              Các ví dụ cho <strong>{selectedInputType}</strong>
                              :
                            </p>
                            <div className="mt-1">
                              {Object.keys(DATA_TYPES).map((lang) => (
                                <div key={lang} className="mb-1">
                                  <strong>{lang}:</strong>{" "}
                                  {DATA_TYPES[lang]?.[selectedInputType] ||
                                    "Kiểu không khả dụng"}
                                </div>
                              ))}
                            </div>
                          </div>
                        }
                      >
                        <InfoCircleOutlined className="ml-2 text-gray-400" />
                      </Tooltip>
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Dữ liệu đầu vào là bắt buộc",
                    },
                    { validator: validateInputData },
                  ]}
                  help={
                    <div className="flex justify-between">
                      <span>
                        Ví dụ: [{"{'input':'[1,2,3,4,5]','dataType':'int[]'}"},{" "}
                        {"{'input':'10','dataType':'int'}"}]
                      </span>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => insertTestCaseExample("input")}
                      >
                        Chèn ví dụ
                      </Button>
                    </div>
                  }
                >
                  <TextArea rows={5} />
                </Form.Item>
              </Card>

              <Card title="Kết quả mong đợi">
                <Form.Item name="outputType" label="Loại dữ liệu đầu ra">
                  <Select
                    onChange={(value) => setSelectedOutputType(value)}
                    placeholder="Chọn kiểu dữ liệu đầu ra"
                  >
                    <Option value="integer">Số nguyên</Option>
                    <Option value="array">Mảng</Option>
                    <Option value="string">Chuỗi</Option>
                    <Option value="boolean">Boolean</Option>
                    <Option value="object">Đối tượng</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="expectedOutputData"
                  label={
                    <div className="flex items-center">
                      Dữ liệu đầu ra (JSON)
                      <Tooltip
                        title={
                          <div>
                            <p>
                              <strong>Định dạng mẫu:</strong>{" "}
                              <code>
                                {
                                  "{'expectedOutput':'giá_trị','dataType':'kiểu_dữ_liệu'}"
                                }
                              </code>
                            </p>
                            <p>
                              Các ví dụ cho{" "}
                              <strong>{selectedOutputType}</strong>:
                            </p>
                            <div className="mt-1">
                              {Object.keys(DATA_TYPES).map((lang) => (
                                <div key={lang} className="mb-1">
                                  <strong>{lang}:</strong>{" "}
                                  {DATA_TYPES[lang]?.[selectedOutputType] ||
                                    "Kiểu không khả dụng"}
                                </div>
                              ))}
                            </div>
                          </div>
                        }
                      >
                        <InfoCircleOutlined className="ml-2 text-gray-400" />
                      </Tooltip>
                    </div>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Dữ liệu đầu ra là bắt buộc",
                    },
                    { validator: validateOutputData },
                  ]}
                  help={
                    <div className="flex justify-between">
                      <span>
                        Ví dụ: {"{'expectedOutput':'15','dataType':'int'}"}
                      </span>
                      <Button
                        type="link"
                        size="small"
                        onClick={() => insertTestCaseExample("output")}
                      >
                        Chèn ví dụ
                      </Button>
                    </div>
                  }
                >
                  <TextArea rows={5} />
                </Form.Item>
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
    </div>
  );
};

export default TestCaseManager;
