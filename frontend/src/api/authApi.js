import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const signUp = async (data) => {
  const response = await axios.post(`${API_URL}/signup`, data);
  return response.data;
};

export const signIn = async (data) => {
  const response = await axios.post(`${API_URL}/signin`, data);
  return response.data;
};
