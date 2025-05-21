import axios from "axios";

const API_URL = "http://localhost:8080/api/problems";

export const getProblems = async () => {
  const response = await axios.get(API_URL);
  return response.data;
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
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
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
