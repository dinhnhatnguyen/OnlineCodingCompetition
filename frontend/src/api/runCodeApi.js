import axios from "axios";

const API_URL = "http://localhost:8080/api/run";

// Gửi code để chạy thử
export const runCode = async (data) => {
  try {
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
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error running code");
  }
};
