import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

axios.defaults.headers.common["Content-Type"] = "application/json";

export const signUp = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, {
      username: data.username,
      email: data.email,
      password: data.password,
    });
    return response.data;
  } catch (error) {
    console.error("SignUp API error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Handle specific error cases
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 400) {
      throw new Error("Invalid registration data");
    } else if (error.response?.status === 500) {
      throw new Error("Server error occurred. Please try again later.");
    } else {
      throw new Error("An error occurred during signup");
    }
  }
};

export const signIn = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/signin`, {
      username: data.username,
      password: data.password,
    });

    // Store the token and user data in localStorage
    const { token, ...userData } = response.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    // Set the token in axios headers for future requests
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    return response.data;
  } catch (error) {
    console.error("SignIn API error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.response?.status === 401) {
      throw new Error("Invalid username or password");
    } else {
      throw new Error("An error occurred during signin");
    }
  }
};

export const signOut = () => {
  // Remove token and user data from localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Remove token from axios headers
  delete axios.defaults.headers.common["Authorization"];
};
