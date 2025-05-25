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
