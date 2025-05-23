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
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting contest:", error);
    throw error;
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
