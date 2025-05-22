import React, { useState, useEffect } from "react";
import { getContestLeaderboard } from "../../api/contestApi";
import { IoMdRefresh } from "react-icons/io";

const LeaderboardTab = ({ contestId, token }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getContestLeaderboard(contestId, token);
      setLeaderboard(data);
      setError("");
    } catch (err) {
      console.error("Lỗi khi tải bảng xếp hạng:", err);
      setError("Không thể tải bảng xếp hạng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [contestId, token]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  if (loading && !refreshing) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-pink"></div>
        <p className="mt-2 text-gray-400">Đang tải bảng xếp hạng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-md">
        <h3 className="font-bold mb-2">Lỗi</h3>
        <p>{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-md flex items-center"
        >
          <IoMdRefresh className="mr-2" />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bảng Xếp Hạng</h2>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md flex items-center ${
            refreshing ? "opacity-50 cursor-wait" : ""
          }`}
          title="Làm mới bảng xếp hạng"
        >
          <IoMdRefresh className={`mr-1 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Đang làm mới..." : "Làm mới"}
        </button>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-gray-400 text-center py-6">
          <p>Chưa có dữ liệu bảng xếp hạng cho cuộc thi này.</p>
          <p className="text-sm mt-2">
            Có thể chưa có bài nộp hoặc cuộc thi chưa bắt đầu.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-zinc-800 text-gray-400">
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Người dùng</th>
                <th className="py-3 px-4 text-right">Điểm</th>
                <th className="py-3 px-4 text-right">Thời gian đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr
                  key={entry.id}
                  className={`border-b border-zinc-800 hover:bg-zinc-800/50 ${
                    index < 3 ? "font-semibold" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    {index === 0 ? (
                      <span className="text-yellow-500 font-bold">🏆 1</span>
                    ) : index === 1 ? (
                      <span className="text-gray-300 font-bold">🥈 2</span>
                    ) : index === 2 ? (
                      <span className="text-amber-600 font-bold">🥉 3</span>
                    ) : (
                      index + 1
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="ml-2">
                        <div
                          className={`font-medium ${
                            index < 3 ? "text-primary-pink" : "text-white"
                          }`}
                        >
                          {entry.username}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {entry.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-semibold ${
                        index === 0
                          ? "text-yellow-500"
                          : index === 1
                          ? "text-gray-300"
                          : index === 2
                          ? "text-amber-600"
                          : "text-white"
                      }`}
                    >
                      {entry.totalScore !== null &&
                      entry.totalScore !== undefined
                        ? entry.totalScore.toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-gray-400">
                    {new Date(entry.registeredAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 p-4 bg-zinc-800/50 rounded-md border border-zinc-700">
        <h3 className="font-medium mb-2 text-primary-pink">
          Về cách tính điểm
        </h3>
        <p className="text-sm text-gray-300">
          Điểm số được tính bằng tổng điểm của các bài nộp đúng. Mỗi bài toán,
          điểm số phụ thuộc vào độ khó và số lượng test case vượt qua.
          <br />
          Điểm bảng xếp hạng sẽ được cập nhật tự động khi bạn nộp bài.
        </p>
      </div>
    </div>
  );
};

export default LeaderboardTab;
