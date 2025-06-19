import axios from "axios";

const API_URL = "http://localhost:8080/api/contests/chat";

// Gửi tin nhắn mới
export const sendMessage = async (messageData) => {
  try {
    const response = await axios.post(API_URL, messageData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi gửi tin nhắn"
    );
  }
};

// Lấy danh sách tin nhắn của contest
export const getMessagesByContest = async (contestId, page = 0, size = 20) => {
  try {
    const response = await axios.get(`${API_URL}/contest/${contestId}`, {
      params: { page, size },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy danh sách tin nhắn"
    );
  }
};

// Lấy tin nhắn mới nhất
export const getRecentMessages = async (contestId, limit = 50) => {
  try {
    const response = await axios.get(`${API_URL}/contest/${contestId}/recent`, {
      params: { limit },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy tin nhắn mới nhất"
    );
  }
};

// Lấy tin nhắn sau một thời điểm cụ thể
export const getMessagesAfter = async (contestId, since) => {
  try {
    const response = await axios.get(`${API_URL}/contest/${contestId}/since`, {
      params: { since: since.toISOString().slice(0, 19) },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy tin nhắn mới"
    );
  }
};

// Cập nhật tin nhắn
export const updateMessage = async (messageId, message) => {
  try {
    const response = await axios.put(
      `${API_URL}/${messageId}`,
      { message },
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
      error.response?.data?.message || "Lỗi khi cập nhật tin nhắn"
    );
  }
};

// Xóa tin nhắn
export const deleteMessage = async (messageId) => {
  try {
    await axios.delete(`${API_URL}/${messageId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi xóa tin nhắn"
    );
  }
};

// Bật/tắt chat cho contest
export const toggleContestChat = async (contestId, enabled) => {
  try {
    await axios.put(
      `${API_URL}/contest/${contestId}/toggle`,
      { enabled },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi thay đổi cài đặt chat"
    );
  }
};

// Kiểm tra trạng thái chat của contest
export const getChatStatus = async (contestId) => {
  try {
    const response = await axios.get(`${API_URL}/contest/${contestId}/status`);
    return response.data.enabled;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi kiểm tra trạng thái chat"
    );
  }
};
