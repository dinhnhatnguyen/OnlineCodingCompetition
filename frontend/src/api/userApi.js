import axios from "axios";

const API_URL = "http://localhost:8080/api/users";

export const getUserProfile = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const getAllUsers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const updateUserRole = async (userId, role, token) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${userId}/role`,
      { role },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

export const updateProfile = async (data, token) => {
  try {
    const response = await axios.put(`${API_URL}/profile`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const changePassword = async (data, token) => {
  try {
    const response = await axios.post(`${API_URL}/change-password`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

export const resetPassword = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, data);
    return response.data;
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
};

/**
 * Get current user information (for Firebase data collection)
 * Lấy thông tin người dùng hiện tại (cho thu thập dữ liệu Firebase)
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error getting current user:", error);
    throw error;
  }
};

/**
 * Extract user info from JWT token (fallback method)
 * Trích xuất thông tin user từ JWT token (phương pháp dự phòng)
 */
export const extractUserFromToken = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      return null;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const payload = JSON.parse(atob(parts[1]));

    return {
      userId: payload.userId || payload.sub || payload.id,
      userName: payload.userName || payload.username || payload.name,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    console.error("Error extracting user from token:", error);
    return null;
  }
};

/**
 * Get user info with fallback
 * Lấy thông tin user với phương pháp dự phòng
 */
export const getUserInfo = async () => {
  try {
    // Try to get from API first
    console.log(" Trying to get user info from API...");
    const userFromApi = await getCurrentUser();
    console.log(" Got user info from API:", userFromApi);
    return userFromApi;
  } catch (apiError) {
    console.warn(
      " Failed to get user from API, trying token extraction:",
      apiError.message
    );

    // Fallback to token extraction
    const userFromToken = extractUserFromToken();
    if (userFromToken) {
      console.log(" Got user info from token:", userFromToken);
      return {
        id: userFromToken.userId,
        username: userFromToken.userName,
        email: userFromToken.email,
        role: userFromToken.role,
      };
    }

    console.error(" Failed to get user info from both API and token");
    throw new Error("Unable to get user information");
  }
};
