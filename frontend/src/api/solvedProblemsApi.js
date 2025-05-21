import axios from "axios";

const API_URL = "http://localhost:8080/api/submissions";

// Lấy danh sách bài đã giải của người dùng
export const getSolvedProblems = async () => {
  try {
    const response = await axios.get(`${API_URL}/user/solved`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching solved problems"
    );
  }
};
