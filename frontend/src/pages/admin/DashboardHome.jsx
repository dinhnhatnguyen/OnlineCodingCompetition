import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, List } from "antd";
import {
  CodeOutlined,
  TrophyOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { getProblems, getMyProblems } from "../../api/problemApi";
import { getContests, getMyContests } from "../../api/contestCrudApi";
import { getReportsStatistics } from "../../api/reportsApi";
import { useAuth } from "../../contexts/AuthContext";

const DashboardHome = () => {
  const [problemCount, setProblemCount] = useState(0);
  const [contestCount, setContestCount] = useState(0);
  const [reportsStats, setReportsStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentProblems, setRecentProblems] = useState([]);
  const [recentContests, setRecentContests] = useState([]);
  const { user, token } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Use appropriate APIs based on user role
        const problemsData = isAdmin
          ? await getProblems()
          : await getMyProblems(token);

        const contestsData = isAdmin
          ? await getContests()
          : await getMyContests(token);

        setProblemCount(problemsData.length);
        setContestCount(contestsData.length);

        // Get 5 most recent problems
        const sortedProblems = [...problemsData].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentProblems(sortedProblems.slice(0, 5));

        // Get 5 most recent contests
        const sortedContests = [...contestsData].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentContests(sortedContests.slice(0, 5));

        // Fetch reports statistics if admin
        if (isAdmin) {
          const reportsData = await getReportsStatistics();
          setReportsStats(reportsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin, token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Bảng điều khiển</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng số bài tập"
              value={problemCount}
              prefix={<CodeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng số cuộc thi"
              value={contestCount}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng báo cáo"
              value={reportsStats.total || 0}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card loading={loading}>
            <Statistic
              title="Báo cáo chờ xử lý"
              value={reportsStats.pending || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} md={12}>
          <Card
            title={`Bài tập ${isAdmin ? "" : "do bạn tạo"}`}
            loading={loading}
            extra={<a href="/admin/problems">Xem tất cả</a>}
          >
            <List
              dataSource={recentProblems}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={`Độ khó: ${item.difficulty}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: "Không tìm thấy bài tập nào" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title={`Cuộc thi ${isAdmin ? "" : "do bạn tạo"}`}
            loading={loading}
            extra={<a href="/admin/contests">Xem tất cả</a>}
          >
            <List
              dataSource={recentContests}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={`Trạng thái: ${item.status}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: "Không tìm thấy cuộc thi nào" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHome;
