import React, { useState, useEffect } from "react";
import { Table, Tag, Badge, Button, Tooltip, Modal } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  CodeOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import {
  getSubmissionsByProblem,
  getSubmissionById,
} from "../../api/submissionApi";
import { formatDistanceToNow } from "date-fns";
import { Editor } from "@monaco-editor/react";

const SubmissionHistory = ({
  problemId,
  contestId = null,
  refreshTrigger = 0,
}) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [codeModalVisible, setCodeModalVisible] = useState(false);
  const { token } = useAuth();

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getSubmissionsByProblem(problemId, token);
      // Filter by contest if contestId provided
      const filteredData = contestId
        ? data.filter((s) => s.contestId === contestId)
        : data;
      setSubmissions(filteredData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (problemId) {
      fetchSubmissions();
    }
  }, [problemId, refreshTrigger]);

  const getStatusColor = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "success";
      case "WRONG_ANSWER":
        return "error";
      case "RUNTIME_ERROR":
        return "warning";
      case "TIME_LIMIT_EXCEEDED":
        return "warning";
      case "COMPILE_ERROR":
        return "error";
      case "MEMORY_LIMIT_EXCEEDED":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircleOutlined />;
      case "WRONG_ANSWER":
        return <CloseCircleOutlined />;
      case "PENDING":
        return <ClockCircleOutlined spin />;
      default:
        return <CloseCircleOutlined />;
    }
  };

  const viewSubmissionCode = async (submissionId) => {
    try {
      const submission = await getSubmissionById(submissionId);
      setSelectedSubmission(submission);
      setCodeModalVisible(true);
    } catch (error) {
      console.error("Error fetching submission details:", error);
    }
  };

  const columns = [
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status) => (
        <Tag icon={getStatusIcon(status)} color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Thời gian chạy",
      dataIndex: "runtimeMs",
      key: "runtime",
      width: "15%",
      render: (runtime) => (runtime ? `${runtime} ms` : "N/A"),
      sorter: (a, b) => a.runtimeMs - b.runtimeMs,
    },
    {
      title: "Bộ nhớ",
      dataIndex: "memoryUsedKb",
      key: "memory",
      width: "15%",
      render: (memory) => (memory ? `${(memory / 1024).toFixed(2)} MB` : "N/A"),
      sorter: (a, b) => a.memoryUsedKb - b.memoryUsedKb,
    },
    {
      title: "Ngôn ngữ",
      dataIndex: "language",
      key: "language",
      width: "10%",
      render: (lang) => lang.charAt(0).toUpperCase() + lang.slice(1),
    },
    {
      title: "Điểm",
      dataIndex: "score",
      key: "score",
      width: "10%",
      render: (score) => (score !== null ? score : "N/A"),
    },
    {
      title: "Test Cases",
      key: "testCases",
      width: "15%",
      render: (_, record) => (
        <span>
          {record.passedTestCases}/{record.totalTestCases}
        </span>
      ),
    },
    {
      title: "Thời gian nộp",
      dataIndex: "submittedAt",
      key: "submittedAt",
      width: "15%",
      render: (time) =>
        formatDistanceToNow(new Date(time), { addSuffix: true }),
      sorter: (a, b) => new Date(a.submittedAt) - new Date(b.submittedAt),
      defaultSortOrder: "descend",
    },
    {
      title: "",
      key: "action",
      width: "5%",
      render: (_, record) => (
        <Tooltip title="Xem code">
          <Button
            icon={<CodeOutlined />}
            size="small"
            onClick={() => viewSubmissionCode(record.id)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="submission-history">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-bold">Lịch sử nộp bài</h3>
        <Button type="primary" onClick={fetchSubmissions}>
          Làm mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={submissions.map((s) => ({ ...s, key: s.id }))}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: "max-content" }}
        bordered
      />

      {/* Modal hiển thị code submission */}
      <Modal
        title={`Submission #${selectedSubmission?.id} - ${selectedSubmission?.status}`}
        open={codeModalVisible}
        onCancel={() => setCodeModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setCodeModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedSubmission && (
          <div>
            <div className="mb-4">
              <Tag color={getStatusColor(selectedSubmission.status)}>
                {selectedSubmission.status}
              </Tag>
              <span className="ml-2">
                Submitted:{" "}
                {new Date(selectedSubmission.submittedAt).toLocaleString()}
              </span>
              {selectedSubmission.runtimeMs && (
                <span className="ml-2">
                  Runtime: {selectedSubmission.runtimeMs} ms
                </span>
              )}
              {selectedSubmission.memoryUsedKb && (
                <span className="ml-2">
                  Memory: {(selectedSubmission.memoryUsedKb / 1024).toFixed(2)}{" "}
                  MB
                </span>
              )}
            </div>

            {selectedSubmission.compileError && (
              <div className="mb-4">
                <h4>Compilation Error:</h4>
                <pre className="bg-red-100 text-red-800 p-3 rounded overflow-auto">
                  {selectedSubmission.compileError}
                </pre>
              </div>
            )}

            <div className="border rounded overflow-hidden">
              <Editor
                height="400px"
                language={selectedSubmission.language}
                value={selectedSubmission.sourceCode}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubmissionHistory;
