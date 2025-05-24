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
    console.log(`Using token: ${token.substring(0, 20)}...`);

    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Delete response:", response);

    if (response.status === 204 || response.status === 200) {
      return { success: true };
    }

    throw new Error(`Unexpected response status: ${response.status}`);
  } catch (error) {
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

export const createProblemWithTestCases = async (data, token) => {
  const response = await axios.post(
    "http://localhost:8080/api/problems/with-test-cases",
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
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
