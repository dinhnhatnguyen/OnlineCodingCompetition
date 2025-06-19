import React, { useState, useEffect } from "react";
import { Modal, Table, Button, Tag, Space, Tooltip, message } from "antd";
import {
  ExclamationCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  CalendarOutlined,
  TeamOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { getContestsContainingProblem } from "../../api/problemApi";
import { removeProblemFromContest } from "../../api/contestCrudApi";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import moment from "moment";

const ProblemContestsModal = ({
  isOpen,
  onClose,
  problem,
  onProblemRemoved,
}) => {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removingFromContest, setRemovingFromContest] = useState(null);
  const { token } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen && problem?.id) {
      fetchContests();
    }
  }, [isOpen, problem?.id, token]);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const data = await getContestsContainingProblem(problem.id, token);
      setContests(data);
    } catch (error) {
      console.error("Error fetching contests:", error);
      showError(error.message || "Không thể tải danh sách cuộc thi");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromContest = async (contestId, contestTitle) => {
    Modal.confirm({
      title: "Xác nhận xóa bài toán khỏi cuộc thi",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            Bạn có chắc chắn muốn xóa bài toán{" "}
            <strong>"{problem?.title}"</strong> khỏi cuộc thi{" "}
            <strong>"{contestTitle}"</strong>?
          </p>
          <p className="text-yellow-600 mt-2">
            <ExclamationCircleOutlined className="mr-1" />
            Lưu ý: Chỉ có thể xóa bài toán khỏi cuộc thi chưa bắt đầu hoặc đã
            kết thúc.
          </p>
        </div>
      ),
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      centered: true,
      maskClosable: false,
      onOk: async () => {
        setRemovingFromContest(contestId);
        try {
          await removeProblemFromContest(contestId, problem.id, token);
          showSuccess(
            `Đã xóa bài toán khỏi cuộc thi "${contestTitle}" thành công`
          );
          await fetchContests(); // Refresh the list
          if (onProblemRemoved) {
            onProblemRemoved();
          }
        } catch (error) {
          console.error("Error removing problem from contest:", error);
          showError(error.message || "Không thể xóa bài toán khỏi cuộc thi");
        } finally {
          setRemovingFromContest(null);
        }
      },
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      DRAFT: { color: "default", text: "Nháp" },
      UPCOMING: { color: "blue", text: "Sắp diễn ra" },
      ONGOING: { color: "green", text: "Đang diễn ra" },
      COMPLETED: { color: "gray", text: "Đã kết thúc" },
      CANCELLED: { color: "red", text: "Đã hủy" },
    };
    const config = statusConfig[status] || { color: "default", text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const canRemoveFromContest = (status) => {
    return status !== "ONGOING";
  };

  const columns = [
    {
      title: "Tên cuộc thi",
      dataIndex: "title",
      key: "title",
      ellipsis: {
        showTitle: false,
      },
      render: (title) => (
        <Tooltip placement="topLeft" title={title}>
          <span className="font-medium">{title}</span>
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thời gian",
      key: "time",
      width: 200,
      render: (_, record) => (
        <div className="text-sm">
          <div className="flex items-center mb-1">
            <CalendarOutlined className="mr-1 text-gray-500" />
            <span>
              Bắt đầu:{" "}
              {record.startTime
                ? moment(record.startTime).format("DD/MM/YYYY HH:mm")
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center">
            <CalendarOutlined className="mr-1 text-gray-500" />
            <span>
              Kết thúc:{" "}
              {record.endTime
                ? moment(record.endTime).format("DD/MM/YYYY HH:mm")
                : "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Thí sinh",
      key: "participants",
      width: 100,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center">
          <TeamOutlined className="mr-1 text-gray-500" />
          <span>
            {record.currentParticipants || 0}/{record.maxParticipants || "∞"}
          </span>
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      align: "center",
      render: (_, record) => {
        const canRemove = canRemoveFromContest(record.status);

        return (
          <Space>
            <Tooltip title="Xem chi tiết cuộc thi">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => {
                  window.open(`/contests/${record.id}`, "_blank");
                }}
              />
            </Tooltip>
            <Tooltip
              title={
                canRemove
                  ? "Xóa bài toán khỏi cuộc thi"
                  : "Không thể xóa bài toán khỏi cuộc thi đang diễn ra"
              }
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={!canRemove}
                loading={removingFromContest === record.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (canRemove) {
                    handleRemoveFromContest(record.id, record.title);
                  }
                }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center">
          <ExclamationCircleOutlined className="mr-2 text-orange-500" />
          <span>Cuộc thi chứa bài toán: {problem?.title}</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      width={900}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
      ]}
    >
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <div className="flex items-start">
          <ExclamationCircleOutlined className="mr-2 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium mb-1">
              Không thể xóa bài toán này vì đang được sử dụng trong các cuộc thi
            </p>
            <p className="text-yellow-700 text-sm">
              Để xóa bài toán, bạn cần xóa nó khỏi tất cả các cuộc thi hoặc đợi
              các cuộc thi kết thúc. Bài toán chỉ có thể được xóa khỏi cuộc thi
              khi cuộc thi chưa bắt đầu hoặc đã kết thúc.
            </p>
          </div>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={contests}
        loading={loading}
        rowKey="id"
        pagination={false}
        scroll={{ x: 800 }}
        locale={{
          emptyText: "Không có cuộc thi nào chứa bài toán này",
        }}
      />
    </Modal>
  );
};

export default ProblemContestsModal;
