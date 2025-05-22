import axios from "axios";

const API_URL = "http://localhost:8080/api/contests";

export const getRegistrations = async (contestId, token) => {
  const response = await axios.get(`${API_URL}/${contestId}/leaderboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const approveRegistration = async (registrationId, token) => {
  const response = await axios.post(
    `${API_URL}/registrations/${registrationId}/approve`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const rejectRegistration = async (registrationId, token) => {
  const response = await axios.post(
    `${API_URL}/registrations/${registrationId}/reject`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
