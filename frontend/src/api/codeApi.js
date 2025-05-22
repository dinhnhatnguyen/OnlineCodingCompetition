import { API_BASE_URL } from "../config/constants";

// Add this function for scratch code execution
export const runScratchCode = async (code, language, input) => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/run/scratch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({ code, language, input }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Có lỗi xảy ra khi chạy code");
    }

    return await response.json();
  } catch (error) {
    console.error("Error running scratch code:", error);
    throw error;
  }
};
