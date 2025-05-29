import axios from "axios";

const API_URL = "http://localhost:8080/api/contests";

export const getContests = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getContestById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createContest = async (data, token) => {
  const response = await axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateContest = async (id, data, token) => {
  console.log("Contest update data:", JSON.stringify(data, null, 2));
  try {
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Contest update error:", error.response?.data);
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

export const getAvailableProblemsForContest = async (contestId, token) => {
  try {
    const response = await axios.get(
      `${API_URL}/${contestId}/available-problems`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching available problems:", error);
    throw error;
  }
};

export const getMyContests = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/my-contests`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching my contests:", error);
    throw error;
  }
};
