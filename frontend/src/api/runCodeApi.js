import axios from "axios";

const API_URL = "http://localhost:8080/api/run";

// Gửi code để chạy thử
export const runCode = async (data) => {
  try {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Bạn cần đăng nhập để sử dụng chức năng này");
    }

    const response = await axios.post(
      API_URL,
      {
        problemId: data.problemId,
        language: data.language,
        sourceCode: data.sourceCode,
        testCaseIds: data.testCaseIds || [],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Run code error:", error);
    if (error.response?.status === 401) {
      throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại");
    }
    throw new Error(error.response?.data?.message || "Lỗi khi chạy code");
  }
};
