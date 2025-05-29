import React, { useEffect, useState } from "react";
import { Table, Button, Space, Modal, message, Tag } from "antd";
import { EditOutlined, DeleteOutlined, FileOutlined } from "@ant-design/icons";
import ContestForm from "./ContestForm";
import {
  getContests,
  updateContest,
  deleteContest,
} from "../../api/contestApi";
import { useAuth } from "../../contexts/AuthContext";
import { useListManagement } from "../../hooks/useListManagement";

const ContestList = () => {
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const { token } = useAuth();
  const { items: contests, updateList } = useListManagement([]);

  const fetchContests = async () => {
    setLoading(true);
    try {
      const data = await getContests(token);
      updateList(data);
    } catch (error) {
      message.error("Lỗi khi tải danh sách cuộc thi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleEdit = (contest) => {
    setSelectedContest(contest);
    setEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      const updatedContest = await updateContest(
        selectedContest.id,
        values,
        token
      );
      message.success("Cập nhật cuộc thi thành công");

      // Xóa contest cũ khỏi danh sách
      const filteredContests = contests.filter(
        (c) => c.id !== updatedContest.id
      );
      // Thêm contest vừa cập nhật vào đầu danh sách
      const newContests = [updatedContest, ...filteredContests];

      updateList(newContests);
      setEditModalVisible(false);
    } catch (error) {
      message.error("Lỗi khi cập nhật cuộc thi");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteContest(id, token);
      message.success("Xóa cuộc thi thành công");
      const updatedContests = contests.filter((c) => c.id !== id);
      updateList(updatedContests);
    } catch (error) {
      message.error("Lỗi khi xóa cuộc thi");
    }
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "default";
        switch (status) {
          case "DRAFT":
            color = "purple";
            break;
          case "UPCOMING":
            color = "blue";
            break;
          case "ONGOING":
            color = "green";
            break;
          case "COMPLETED":
            color = "gray";
            break;
          case "CANCELLED":
            color = "red";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Loại",
      key: "isPrivate",
      render: (_, record) => (
        <Tag color={record.isPrivate ? "orange" : "green"}>
          {record.isPrivate ? "Riêng tư" : "Công khai"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: "Xác nhận xóa",
                content: "Bạn có chắc chắn muốn xóa cuộc thi này?",
                okText: "Xóa",
                cancelText: "Hủy",
                onOk: () => handleDelete(record.id),
              });
            }}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={contests}
        rowKey="id"
        loading={loading}
      />
      <Modal
        title="Chỉnh sửa cuộc thi"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={800}
      >
        <ContestForm
          initialValues={selectedContest}
          onSubmit={handleUpdate}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default ContestList;
