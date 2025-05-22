import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, List } from "antd";
import { CodeOutlined, TrophyOutlined, UserOutlined } from "@ant-design/icons";
import { getProblems } from "../../api/problemApi";
import { getContests } from "../../api/contestCrudApi";
import { useAuth } from "../../contexts/AuthContext";

const DashboardHome = () => {
  const [problemCount, setProblemCount] = useState(0);
  const [contestCount, setContestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [recentProblems, setRecentProblems] = useState([]);
  const [recentContests, setRecentContests] = useState([]);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const problemsData = await getProblems();
        const contestsData = await getContests();

        // Filter based on role
        const filteredProblems = isAdmin
          ? problemsData
          : problemsData.filter((p) => p.createdById === user?.id);

        const filteredContests = isAdmin
          ? contestsData
          : contestsData.filter((c) => c.createdById === user?.id);

        setProblemCount(filteredProblems.length);
        setContestCount(filteredContests.length);

        // Get 5 most recent problems
        const sortedProblems = [...filteredProblems].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentProblems(sortedProblems.slice(0, 5));

        // Get 5 most recent contests
        const sortedContests = [...filteredContests].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setRecentContests(sortedContests.slice(0, 5));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card loading={loading}>
            <Statistic
              title="Total Problems"
              value={problemCount}
              prefix={<CodeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading}>
            <Statistic
              title="Total Contests"
              value={contestCount}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card loading={loading}>
            <Statistic
              title="Role"
              value={user?.role?.toUpperCase() || ""}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} md={12}>
          <Card
            title="Recent Problems"
            loading={loading}
            extra={<a href="/admin/problems">View All</a>}
          >
            <List
              dataSource={recentProblems}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={`Difficulty: ${item.difficulty}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: "No problems found" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Recent Contests"
            loading={loading}
            extra={<a href="/admin/contests">View All</a>}
          >
            <List
              dataSource={recentContests}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={`Status: ${item.status}`}
                  />
                </List.Item>
              )}
              locale={{ emptyText: "No contests found" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardHome;
