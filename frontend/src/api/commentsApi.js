import axios from "axios";

const API_URL = "http://localhost:8080/api/problems/comments";

// Tạo comment mới
export const createComment = async (commentData) => {
  try {
    const response = await axios.post(API_URL, commentData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi tạo comment"
    );
  }
};

// Lấy danh sách comments của một problem
export const getCommentsByProblem = async (problemId, page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_URL}/problem/${problemId}`, {
      params: { page, size },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy danh sách comments"
    );
  }
};

// Lấy replies của một comment
export const getRepliesByComment = async (commentId) => {
  try {
    const response = await axios.get(`${API_URL}/${commentId}/replies`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy replies"
    );
  }
};

// Cập nhật comment
export const updateComment = async (commentId, content) => {
  try {
    const response = await axios.put(
      `${API_URL}/${commentId}`,
      { content },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi cập nhật comment"
    );
  }
};

// Xóa comment
export const deleteComment = async (commentId) => {
  try {
    await axios.delete(`${API_URL}/${commentId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi xóa comment"
    );
  }
};

// Đếm số lượng comments của một problem
export const countCommentsByProblem = async (problemId) => {
  try {
    const response = await axios.get(`${API_URL}/problem/${problemId}/count`);
    return response.data.count;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi đếm comments"
    );
  }
};
