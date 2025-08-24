import axios from "axios";

const API_URL = "http://localhost:8080/api/problems/reports";

// Tạo báo cáo mới
export const createReport = async (reportData) => {
  try {
    const response = await axios.post(API_URL, reportData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi tạo báo cáo");
  }
};

// Lấy báo cáo của user hiện tại
export const getMyReports = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_URL}/my`, {
      params: { page, size },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy danh sách báo cáo"
    );
  }
};

// Lấy báo cáo theo ID
export const getReportById = async (reportId) => {
  try {
    const response = await axios.get(`${API_URL}/${reportId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy thông tin báo cáo"
    );
  }
};

// Xóa báo cáo
export const deleteReport = async (reportId) => {
  try {
    await axios.delete(`${API_URL}/${reportId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi xóa báo cáo");
  }
};

// Lấy loại báo cáo
export const getReportTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/types`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy loại báo cáo"
    );
  }
};

// Lấy trạng thái báo cáo
export const getReportStatuses = async () => {
  try {
    const response = await axios.get(`${API_URL}/statuses`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy trạng thái báo cáo"
    );
  }
};

// Lấy thống kê báo cáo (Admin only)
export const getReportsStatistics = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/statistics`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy thống kê báo cáo"
    );
  }
};

// === ADMIN FUNCTIONS ===

// Lấy tất cả báo cáo (Admin only)
export const getAllReports = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_URL}/admin/all`, {
      params: { page, size },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy danh sách báo cáo"
    );
  }
};

// Lấy báo cáo theo trạng thái (Admin only)
export const getReportsByStatus = async (status, page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_URL}/admin/status/${status}`, {
      params: { page, size },
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi lấy báo cáo theo trạng thái"
    );
  }
};

// Xem xét báo cáo (Admin only)
export const reviewReport = async (reportId, reviewData) => {
  try {
    const response = await axios.put(
      `${API_URL}/${reportId}/review`,
      reviewData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Lỗi khi xem xét báo cáo");
  }
};

// Đếm báo cáo pending (Admin only)
export const countPendingReports = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/pending/count`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response.data.count;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Lỗi khi đếm báo cáo pending"
    );
  }
};
