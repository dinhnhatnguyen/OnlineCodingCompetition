import axios from "axios";

const API_URL = "http://localhost:8080/api/submissions";

// Gửi code nộp bài
export const submitCode = async (data) => {
  try {
    const response = await axios.post(API_URL, {
      problemId: data.problemId,
      language: data.language,
      sourceCode: data.sourceCode,
      contestId: data.contestId || null,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server trả về lỗi với status code
      const errorMessage =
        error.response.data.error || "Có lỗi xảy ra khi nộp bài";
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      throw new Error("Không thể kết nối đến server");
    } else {
      // Lỗi khi thiết lập request
      throw new Error("Có lỗi xảy ra: " + error.message);
    }
  }
};

// Lấy lịch sử nộp bài của user
export const getUserSubmissions = async () => {
  try {
    const response = await axios.get(`${API_URL}/user`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.error || "Không thể lấy lịch sử nộp bài"
      );
    }
    throw error;
  }
};

// Lấy submission theo ID
export const getSubmissionById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.error || "Không thể lấy thông tin bài nộp"
      );
    }
    throw error;
  }
};

// Lấy submissions theo problem ID
export const getSubmissionsByProblem = async (problemId) => {
  try {
    const response = await axios.get(`${API_URL}/problem/${problemId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.error || "Không thể lấy danh sách bài nộp"
      );
    }
    throw error;
  }
};

// Lấy submissions trong contest
export const getContestSubmissions = async (contestId) => {
  try {
    const response = await axios.get(`${API_URL}/contest/${contestId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.error ||
          "Không thể lấy danh sách bài nộp trong cuộc thi"
      );
    }
    throw error;
  }
};

// Lấy leaderboard của contest
export const getContestLeaderboard = async (contestId) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/contests/${contestId}/leaderboard`
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.error || "Không thể lấy bảng xếp hạng"
      );
    }
    throw error;
  }
};

// Poll submission status with requirements:
// 1. Wait 5s before first request
// 2. Continue polling if status is PROCESSING
// 3. Return timeout after total 10s if still PROCESSING
// 4. Return result if status is not PROCESSING
export const pollSubmissionStatus = async (submissionId, maxSeconds = 10) => {
  // First wait 5 seconds before initial check
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const startTime = Date.now();
  const endTime = startTime + maxSeconds * 1000;

  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      // Check if we've exceeded the maximum time
      if (Date.now() >= endTime) {
        resolve({
          status: "TIME_LIMIT_EXCEEDED",
          message: "Submission processing took too long",
        });
        return;
      }

      try {
        const result = await getSubmissionById(submissionId);

        // Return if status is anything other than PROCESSING
        if (result.status !== "PROCESSING" && result.status !== "PENDING") {
          console.log("Submission completed with status:", result.status);
          resolve(result);
          return;
        }

        console.log("Submission still processing, polling again...");
        // Wait 1 second before checking again
        setTimeout(checkStatus, 1000);
      } catch (error) {
        console.error("Error checking submission status:", error);
        reject(error);
      }
    };

    // Start the polling process
    checkStatus();
  });
};
