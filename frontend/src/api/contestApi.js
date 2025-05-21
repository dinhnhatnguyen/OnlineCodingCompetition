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
