import axios from "axios";

const API_URL = "http://localhost:8080/api/contests";

export const getContests = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getContestById = async (id, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.get(`${API_URL}/${id}`, {
    headers: headers,
  });
  return response.data;
};

export const getContestLeaderboard = async (id, token) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await axios.get(`${API_URL}/${id}/leaderboard`, {
    headers: headers,
  });
  return response.data;
};

export const createContest = async (contestData, token) => {
  try {
    const response = await axios.post(API_URL, contestData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating contest:", error);
    throw error;
  }
};

export const updateContest = async (id, contestData, token) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, contestData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating contest:", error);
    throw error;
  }
};

export const deleteContest = async (id, token) => {
  try {
    if (!id) {
      throw new Error("Contest ID is required");
    }

    if (!token) {
      throw new Error("Authorization token is required");
    }

    console.log(`Attempting to delete contest with ID: ${id}`);

    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Xử lý response cho soft delete
    if (response.status === 200) {
      return {
        success: true,
        message: response.data.message || "Cuộc thi đã được xóa thành công",
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

    // Xử lý các lỗi cụ thể và đảm bảo message được truyền đúng
    let errorMessage;
    if (error.response?.status === 403) {
      errorMessage = "Bạn không có quyền xóa cuộc thi này";
    } else if (error.response?.status === 404) {
      errorMessage = "Không tìm thấy cuộc thi";
    } else if (error.response?.status === 400) {
      errorMessage =
        error.response.data.message || "Không thể xóa cuộc thi đang diễn ra";
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else {
      errorMessage = "Có lỗi xảy ra khi xóa cuộc thi";
    }

    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    throw customError;
  }
};

export const registerContest = async (contestId, token) => {
  try {
    console.log("Sending registration request with:", {
      url: `${API_URL}/${contestId}/register`,
      token: token,
    });

    const response = await axios({
      method: "post",
      url: `${API_URL}/${contestId}/register`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Registration response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Registration error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers,
    });
    throw error;
  }
};

// Contest Code APIs
export const getContestByCode = async (contestCode) => {
  try {
    const response = await axios.get(`${API_URL}/code/${contestCode}`);
    return response.data;
  } catch (error) {
    console.error("Error getting contest by code:", error);
    throw error;
  }
};

export const registerByContestCode = async (contestCode, token) => {
  try {
    const response = await axios.post(
      `${API_URL}/code/${contestCode}/register`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error registering by contest code:", error);
    throw error;
  }
};

// Get user's registered contests
export const getMyContests = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/my-registrations`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting my contests:", error);
    throw error;
  }
};
