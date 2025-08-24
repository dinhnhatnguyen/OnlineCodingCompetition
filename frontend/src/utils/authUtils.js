// Utility functions for handling authentication

/**
 * Kiểm tra xem lỗi có phải là lỗi authentication không
 * @param {Error} error - Error object
 * @returns {boolean} - true nếu là lỗi authentication
 */
export const isAuthError = (error) => {
  return (
    error.response?.status === 401 ||
    error.message?.includes("authentication") ||
    error.message?.includes("Full authentication is required")
  );
};

/**
 * Handle authentication error - clear token và redirect nếu cần
 * @param {Error} error - Error object
 * @param {Function} logout - Logout function từ AuthContext
 */
export const handleAuthError = (error, logout) => {
  if (isAuthError(error)) {
    console.warn("Authentication error detected, clearing session");
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Call logout nếu có
    if (logout && typeof logout === "function") {
      logout();
    }
  }
};

/**
 * Safely call API function chỉ khi user đã đăng nhập
 * @param {Function} apiFunction - API function to call
 * @param {Object} user - User object từ AuthContext
 * @param {Function} logout - Logout function từ AuthContext
 * @param {...any} args - Arguments cho API function
 * @returns {Promise} - API response hoặc null nếu user chưa đăng nhập
 */
export const safeAuthenticatedCall = async (apiFunction, user, logout, ...args) => {
  if (!user) {
    console.debug("User not authenticated, skipping API call");
    return null;
  }

  try {
    return await apiFunction(...args);
  } catch (error) {
    handleAuthError(error, logout);
    throw error;
  }
};

/**
 * Check if token exists and is valid format
 * @returns {boolean} - true nếu token tồn tại và có format hợp lệ
 */
export const hasValidToken = () => {
  const token = localStorage.getItem("token");
  return token && token.length > 0 && !token.includes("undefined");
};
