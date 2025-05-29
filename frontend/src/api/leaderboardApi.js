import axios from "axios";

const API_URL = "http://localhost:8080/api/contests";

export const getLeaderboard = async (contestId, token) => {
  const response = await axios.get(`${API_URL}/${contestId}/leaderboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
