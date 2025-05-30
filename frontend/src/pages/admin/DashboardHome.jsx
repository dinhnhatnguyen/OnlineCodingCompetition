import React, { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, List } from "antd";
import { CodeOutlined, TrophyOutlined, UserOutlined } from "@ant-design/icons";
import { getProblems, getMyProblems } from "../../api/problemApi";
import { getContests, getMyContests } from "../../api/contestCrudApi";
import { useAuth } from "../../contexts/AuthContext";

const DashboardHome = () => {
  const [problemCount, setProblemCount] = useState(0);
  const [contestCount, setContestCount] = useState(0);
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
            title={`Problems ${isAdmin ? "" : "Created by You"}`}
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
            title={`Contests ${isAdmin ? "" : "Created by You"}`}
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
