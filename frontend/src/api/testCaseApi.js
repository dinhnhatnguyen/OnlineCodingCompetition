import axios from "axios";

const API_URL = "http://localhost:8080/api/test-cases";

// Lấy một test case theo ID
export const getTestCaseById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Lấy tất cả test case của một problem
export const getTestCasesByProblemId = async (problemId) => {
  const response = await axios.get(`${API_URL}/problem/${problemId}`);
  return response.data;
};

// Lấy các test case ví dụ của một problem
export const getExampleTestCasesByProblemId = async (problemId) => {
  const response = await axios.get(`${API_URL}/problem/${problemId}/examples`);
  return response.data;
};

// Lấy các test case hiển thị của một problem
export const getVisibleTestCasesByProblemId = async (problemId) => {
  const response = await axios.get(`${API_URL}/problem/${problemId}/visible`);
  return response.data;
};

// Tạo một test case mới
export const createTestCase = async (testCaseData, token) => {
  const response = await axios.post(API_URL, testCaseData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Tạo nhiều test case cho một problem
export const createTestCases = async (problemId, testCasesData, token) => {
  const response = await axios.post(
    `${API_URL}/batch/${problemId}`,
    testCasesData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// Cập nhật một test case
export const updateTestCase = async (id, testCaseData, token) => {
  const response = await axios.put(`${API_URL}/${id}`, testCaseData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Xóa một test case
export const deleteTestCase = async (id, token) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// Xóa tất cả test case của một problem
export const deleteAllTestCasesByProblemId = async (problemId, token) => {
  const response = await axios.delete(`${API_URL}/problem/${problemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
