import React, { useState, useEffect } from "react";
import { Table, Tag, Avatar, Tooltip, Card, Button, Tabs } from "antd";
import {
  TrophyOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { getContestLeaderboard } from "../../api/submissionApi";

const ContestLeaderboard = ({ contestId }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("score");

  useEffect(() => {
    fetchLeaderboard();
  }, [contestId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getContestLeaderboard(contestId);
      setLeaderboard(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      // Use mock data when API fails
      setLeaderboard(mockLeaderboard);
    } finally {
      setLoading(false);
    }
  };

  // Determine medal color based on rank
  const getMedalColor = (rank) => {
    if (rank === 1) return "gold";
    if (rank === 2) return "silver";
    if (rank === 3) return "bronze";
    return "";
  };

  // Columns for the score-based leaderboard
  const scoreColumns = [
    {
      title: "Hạng",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      fixed: "left",
      render: (rank) => (
        <div className="flex items-center">
          {rank <= 3 ? (
            <TrophyOutlined
              style={{
                color:
                  getMedalColor(rank) === "gold"
                    ? "#FFD700"
                    : getMedalColor(rank) === "silver"
                    ? "#C0C0C0"
                    : getMedalColor(rank) === "bronze"
                    ? "#CD7F32"
                    : "",
                fontSize: "18px",
                marginRight: "5px",
              }}
            />
          ) : null}
          <span>{rank}</span>
        </div>
      ),
    },
    {
      title: "Thí sinh",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <div className="flex items-center">
          <Avatar icon={<UserOutlined />} className="mr-2" />
          <span>{user.username}</span>
        </div>
      ),
      fixed: "left",
      width: 200,
    },
    {
      title: "Số điểm",
      dataIndex: "totalScore",
      key: "totalScore",
      sorter: (a, b) => a.totalScore - b.totalScore,
      defaultSortOrder: "descend",
      width: 100,
      render: (score) => <span className="font-bold">{score}</span>,
    },
    {
      title: "Số bài đã giải",
      dataIndex: "solvedCount",
      key: "solvedCount",
      width: 120,
      render: (count, record) => (
        <span>
          {count}/{record.totalProblems}
        </span>
      ),
    },
    {
      title: "Thời gian nộp bài cuối",
      dataIndex: "lastSubmissionTime",
      key: "lastSubmissionTime",
      width: 180,
      render: (time) => (
        <span>
          <ClockCircleOutlined className="mr-1" />
          {new Date(time).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Chi tiết từng bài",
      dataIndex: "problemResults",
      key: "problemResults",
      render: (results) => (
        <div className="flex flex-wrap gap-2">
          {results.map((result) => (
            <Tooltip
              key={result.problemId}
              title={
                <div>
                  <div>
                    Bài {result.problemId}: {result.problemTitle}
                  </div>
                  <div>Điểm: {result.score}</div>
                  <div>Trạng thái: {result.status}</div>
                  <div>
                    Thời gian nộp:{" "}
                    {new Date(result.submittedAt).toLocaleString()}
                  </div>
                </div>
              }
            >
              <Tag
                color={
                  result.status === "Accepted"
                    ? "green"
                    : result.status === "Pending"
                    ? "blue"
                    : result.status === "Wrong Answer"
                    ? "red"
                    : "orange"
                }
                icon={
                  result.status === "Accepted" ? (
                    <CheckCircleOutlined />
                  ) : result.status === "Pending" ? (
                    <ClockCircleOutlined />
                  ) : (
                    <QuestionCircleOutlined />
                  )
                }
              >
                Bài {result.problemId}: {result.score}
              </Tag>
            </Tooltip>
          ))}
        </div>
      ),
    },
  ];

  // Columns for the time-based leaderboard (for contests that prioritize speed)
  const timeColumns = [
    {
      title: "Hạng",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      fixed: "left",
      render: (rank) => (
        <div className="flex items-center">
          {rank <= 3 ? (
            <TrophyOutlined
              style={{
                color:
                  getMedalColor(rank) === "gold"
                    ? "#FFD700"
                    : getMedalColor(rank) === "silver"
                    ? "#C0C0C0"
                    : getMedalColor(rank) === "bronze"
                    ? "#CD7F32"
                    : "",
                fontSize: "18px",
                marginRight: "5px",
              }}
            />
          ) : null}
          <span>{rank}</span>
        </div>
      ),
    },
    {
      title: "Thí sinh",
      dataIndex: "user",
      key: "user",
      render: (user) => (
        <div className="flex items-center">
          <Avatar icon={<UserOutlined />} className="mr-2" />
          <span>{user.username}</span>
        </div>
      ),
      fixed: "left",
      width: 200,
    },
    {
      title: "Số bài đã giải",
      dataIndex: "solvedCount",
      key: "solvedCount",
      width: 120,
      render: (count, record) => (
        <span>
          {count}/{record.totalProblems}
        </span>
      ),
    },
    {
      title: "Tổng thời gian",
      dataIndex: "totalTime",
      key: "totalTime",
      sorter: (a, b) => a.totalTime - b.totalTime,
      width: 120,
      render: (time) => (
        <span>
          <ClockCircleOutlined className="mr-1" />
          {Math.floor(time / 60)}m {time % 60}s
        </span>
      ),
    },
    {
      title: "Chi tiết từng bài",
      dataIndex: "problemResults",
      key: "problemResults",
      render: (results) => (
        <div className="flex flex-wrap gap-2">
          {results.map((result) => (
            <Tooltip
              key={result.problemId}
              title={
                <div>
                  <div>
                    Bài {result.problemId}: {result.problemTitle}
                  </div>
                  <div>Trạng thái: {result.status}</div>
                  <div>
                    Thời gian giải: {Math.floor(result.solveTime / 60)}m{" "}
                    {result.solveTime % 60}s
                  </div>
                  <div>
                    Thời gian nộp:{" "}
                    {new Date(result.submittedAt).toLocaleString()}
                  </div>
                </div>
              }
            >
              <Tag
                color={
                  result.status === "Accepted"
                    ? "green"
                    : result.status === "Pending"
                    ? "blue"
                    : result.status === "Wrong Answer"
                    ? "red"
                    : "orange"
                }
                icon={
                  result.status === "Accepted" ? (
                    <CheckCircleOutlined />
                  ) : result.status === "Pending" ? (
                    <ClockCircleOutlined />
                  ) : (
                    <QuestionCircleOutlined />
                  )
                }
              >
                Bài {result.problemId}: {Math.floor(result.solveTime / 60)}m{" "}
                {result.solveTime % 60}s
              </Tag>
            </Tooltip>
          ))}
        </div>
      ),
    },
  ];

  // Mock data for leaderboard
  const mockLeaderboard = [
    {
      rank: 1,
      userId: 1,
      user: {
        id: 1,
        username: "codeMaster98",
      },
      totalScore: 300,
      solvedCount: 3,
      totalProblems: 3,
      lastSubmissionTime: "2023-05-15T10:30:00Z",
      totalTime: 3500, // Tổng thời gian theo giây
      problemResults: [
        {
          problemId: 1,
          problemTitle: "Two Sum",
          score: 100,
          status: "Accepted",
          submittedAt: "2023-05-15T09:15:00Z",
          solveTime: 900, // Thời gian giải theo giây
        },
        {
          problemId: 2,
          problemTitle: "Reverse Linked List",
          score: 100,
          status: "Accepted",
          submittedAt: "2023-05-15T09:45:00Z",
          solveTime: 1200,
        },
        {
          problemId: 3,
          problemTitle: "Merge Intervals",
          score: 100,
          status: "Accepted",
          submittedAt: "2023-05-15T10:30:00Z",
          solveTime: 1400,
        },
      ],
    },
    {
      rank: 2,
      userId: 2,
      user: {
        id: 2,
        username: "algorithmic_queen",
      },
      totalScore: 200,
      solvedCount: 2,
      totalProblems: 3,
      lastSubmissionTime: "2023-05-15T10:20:00Z",
      totalTime: 4200,
      problemResults: [
        {
          problemId: 1,
          problemTitle: "Two Sum",
          score: 100,
          status: "Accepted",
          submittedAt: "2023-05-15T09:10:00Z",
          solveTime: 1800,
        },
        {
          problemId: 2,
          problemTitle: "Reverse Linked List",
          score: 100,
          status: "Accepted",
          submittedAt: "2023-05-15T10:20:00Z",
          solveTime: 2400,
        },
        {
          problemId: 3,
          problemTitle: "Merge Intervals",
          score: 0,
          status: "Wrong Answer",
          submittedAt: "2023-05-15T10:15:00Z",
          solveTime: 0,
        },
      ],
    },
    {
      rank: 3,
      userId: 3,
      user: {
        id: 3,
        username: "codeNinja2023",
      },
      totalScore: 200,
      solvedCount: 2,
      totalProblems: 3,
      lastSubmissionTime: "2023-05-15T10:45:00Z",
      totalTime: 4800,
      problemResults: [
        {
          problemId: 1,
          problemTitle: "Two Sum",
          score: 100,
          status: "Accepted",
          submittedAt: "2023-05-15T09:30:00Z",
          solveTime: 2100,
        },
        {
          problemId: 2,
          problemTitle: "Reverse Linked List",
          score: 100,
          status: "Accepted",
          submittedAt: "2023-05-15T10:45:00Z",
          solveTime: 2700,
        },
        {
          problemId: 3,
          problemTitle: "Merge Intervals",
          score: 0,
          status: "Pending",
          submittedAt: null,
          solveTime: 0,
        },
      ],
    },
    {
      rank: 4,
      userId: 4,
      user: {
        id: 4,
        username: "programmingPro",
      },
      totalScore: 100,
      solvedCount: 1,
      totalProblems: 3,
      lastSubmissionTime: "2023-05-15T09:40:00Z",
      totalTime: 2400,
      problemResults: [
        {
          problemId: 1,
          problemTitle: "Two Sum",
          score: 100,
          status: "Accepted",
          submittedAt: "2023-05-15T09:40:00Z",
          solveTime: 2400,
        },
        {
          problemId: 2,
          problemTitle: "Reverse Linked List",
          score: 0,
          status: "Wrong Answer",
          submittedAt: "2023-05-15T10:10:00Z",
          solveTime: 0,
        },
        {
          problemId: 3,
          problemTitle: "Merge Intervals",
          score: 0,
          status: "Pending",
          submittedAt: null,
          solveTime: 0,
        },
      ],
    },
  ];

  const items = [
    {
      key: "score",
      label: "Xếp theo điểm",
      children: (
        <Table
          columns={scoreColumns}
          dataSource={leaderboard}
          rowKey="userId"
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
          size="middle"
        />
      ),
    },
    {
      key: "time",
      label: "Xếp theo thời gian",
      children: (
        <Table
          columns={timeColumns}
          dataSource={leaderboard.sort((a, b) => {
            if (b.solvedCount !== a.solvedCount) {
              return b.solvedCount - a.solvedCount;
            }
            return a.totalTime - b.totalTime;
          })}
          rowKey="userId"
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
          size="middle"
        />
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex items-center">
          <TrophyOutlined className="text-yellow-500 mr-2 text-xl" />
          <span className="text-xl">Bảng xếp hạng</span>
        </div>
      }
    >
      <Tabs items={items} activeKey={activeTab} onChange={setActiveTab} />

      <div className="mt-4 text-gray-600 text-sm">
        <h4 className="font-bold mb-2">Cách tính điểm:</h4>
        <ul className="list-disc pl-5">
          <li>Mỗi bài tập có giá trị điểm khác nhau tùy vào độ khó</li>
          <li>Điểm tối đa cho mỗi bài: Easy (100), Medium (200), Hard (300)</li>
          <li>
            Submission được chấp nhận với mọi ngôn ngữ lập trình được hỗ trợ
          </li>
          <li>
            Trong trường hợp điểm bằng nhau, người nộp bài sớm hơn sẽ được xếp
            hạng cao hơn
          </li>
        </ul>
      </div>
    </Card>
  );
};

export default ContestLeaderboard;
