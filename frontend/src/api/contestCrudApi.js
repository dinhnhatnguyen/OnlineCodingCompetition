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
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
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
