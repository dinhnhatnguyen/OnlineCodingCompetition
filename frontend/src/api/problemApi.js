import axios from "axios";

const API_URL = "http://localhost:8080/api/problems";

export const getProblems = async () => {
  try {
    const response = await axios.get(`${API_URL}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching problems:", error);
    throw error;
  }
};

export const getProblemById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createProblem = async (data, token) => {
  const response = await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateProblem = async (id, data, token) => {
  const response = await axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteProblem = async (id, token) => {
  try {
    if (!id) {
      throw new Error("Problem ID is required");
    }

    if (!token) {
      throw new Error("Authorization token is required");
    }

    console.log(`Attempting to delete problem with ID: ${id}`);

    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Xử lý response cho soft delete
    if (response.status === 200) {
      return {
        success: true,
        message: "Bài toán đã được xóa thành công",
        softDeleted: true,
      };
    }

    throw new Error(`Unexpected response status: ${response.status}`);
  } catch (error) {
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Xử lý các lỗi cụ thể
    if (error.response?.status === 403) {
      throw new Error("Bạn không có quyền xóa bài toán này");
    } else if (error.response?.status === 404) {
      throw new Error("Không tìm thấy bài toán");
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
};

export const createProblemWithTestCases = async (data, token) => {
  try {
    console.log(
      "Sending request to create problem with test cases:",
      JSON.stringify(data, null, 2)
    );

    // Validate the data structure before sending
    if (!data.createProblem) {
      throw new Error("Missing createProblem data");
    }

    if (!data.createTestCases || !Array.isArray(data.createTestCases)) {
      throw new Error("Missing or invalid createTestCases data");
    }

    if (data.createTestCases.length < 2) {
      throw new Error("At least 2 test cases are required");
    }

    // Validate each test case has required fields
    data.createTestCases.forEach((testCase, index) => {
      const requiredFields = ["inputData", "expectedOutputData", "description"];
      requiredFields.forEach((field) => {
        if (!testCase[field]) {
          throw new Error(
            `Test case ${index + 1} is missing required field: ${field}`
          );
        }
      });
    });

    const response = await axios.post(
      "http://localhost:8080/api/problems/with-test-cases",
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Successfully created problem with test cases:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating problem with test cases:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      data: data,
    });
    throw error;
  }
};

export const updateProblemWithTestCases = async (id, data, token) => {
  console.log(
    "Updating problem with test cases:",
    JSON.stringify(data, null, 2)
  );
  try {
    const response = await axios.put(
      `http://localhost:8080/api/problems/${id}/with-test-cases`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating problem with test cases:",
      error.response?.data
    );
    throw error;
  }
};

export const getMyProblems = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/my-problems`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching my problems:", error);
    throw error;
  }
};

export const getContestsContainingProblem = async (problemId, token) => {
  try {
    if (!problemId) {
      throw new Error("Problem ID is required");
    }

    if (!token) {
      throw new Error("Authorization token is required");
    }

    console.log(`Fetching contests containing problem with ID: ${problemId}`);
    console.log(`API URL: ${API_URL}/${problemId}/contests`);

    const response = await axios.get(`${API_URL}/${problemId}/contests`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching contests containing problem:", error);
    console.error("Error response:", error.response);

    if (error.response?.status === 401) {
      throw new Error("Không có quyền truy cập. Vui lòng đăng nhập lại.");
    }

    if (error.response?.status === 404) {
      throw new Error("Không tìm thấy bài toán.");
    }

    throw error;
  }
};

// Remove problem from contest
export const removeProblemFromContest = async (contestId, problemId, token) => {
  console.log("=== removeProblemFromContest API FUNCTION START ===");
  console.log("Input parameters:", {
    contestId,
    problemId,
    tokenExists: !!token,
  });

  try {
    if (!contestId) {
      console.error("Contest ID is missing");
      throw new Error("Contest ID is required");
    }

    if (!problemId) {
      console.error("Problem ID is missing");
      throw new Error("Problem ID is required");
    }

    if (!token) {
      console.error("Token is missing");
      throw new Error("Authorization token is required");
    }

    const apiUrl = `${API_URL}/${problemId}/contests/${contestId}`;
    console.log(`=== MAKING DELETE REQUEST ===`);
    console.log(`API URL: ${apiUrl}`);
    console.log(`Headers:`, {
      Authorization: `Bearer ${token.substring(0, 10)}...`,
      "Content-Type": "application/json",
    });

    const response = await axios.delete(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("=== API RESPONSE SUCCESS ===");
    console.log("Status:", response.status);
    console.log("Data:", response.data);
    console.log("Headers:", response.headers);

    return response.data;
  } catch (error) {
    console.error("=== API CALL FAILED ===");
    console.error("Error object:", error);
    console.error("Error message:", error.message);
    console.error("Error response:", error.response);
    console.error("Error config:", error.config);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      console.error("Response headers:", error.response.headers);
    }

    if (error.response?.status === 401) {
      throw new Error("Không có quyền truy cập. Vui lòng đăng nhập lại.");
    }

    if (error.response?.status === 404) {
      throw new Error("Không tìm thấy bài toán hoặc cuộc thi.");
    }

    if (error.response?.status === 400) {
      throw new Error(
        error.response.data?.message || "Không thể xóa bài toán khỏi cuộc thi."
      );
    }

    throw error;
  }
};

// Lấy tất cả các chủ đề có sẵn từ database
export const getAllTopics = async () => {
  try {
    const response = await axios.get(`${API_URL}/topics`);
    return response.data;
  } catch (error) {
    console.error("Error fetching topics:", error);
    throw error;
  }
};

export const restoreProblem = async (id, token) => {
  try {
    if (!id) {
      throw new Error("Problem ID is required");
    }

    if (!token) {
      throw new Error("Authorization token is required");
    }

    console.log(`Attempting to restore problem with ID: ${id}`);

    const response = await axios.post(`${API_URL}/${id}/restore`, null, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return {
        success: true,
        message: "Bài toán đã được khôi phục thành công",
      };
    }

    throw new Error(`Unexpected response status: ${response.status}`);
  } catch (error) {
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 403) {
      throw new Error("Bạn không có quyền khôi phục bài toán này");
    } else if (error.response?.status === 404) {
      throw new Error("Không tìm thấy bài toán");
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    throw error;
  }
};
