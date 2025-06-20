import axios from "axios";

const RECOMMENDATION_API_URL = "http://localhost:3000";

/**
 * Get similar problems based on current problem title
 * Lấy danh sách bài toán tương tự dựa trên tiêu đề bài toán hiện tại
 *
 * @param {string} problemTitle - Title of the current problem
 * @param {number} numRecommendations - Number of recommendations to return (default: 5)
 * @returns {Promise<Object>} Response containing similar problems
 */
export const getSimilarProblems = async (
  problemTitle,
  numRecommendations = 5
) => {
  try {
    const response = await axios.post(
      `${RECOMMENDATION_API_URL}/recommend_books`,
      {
        title: problemTitle,
        num_recommendations: numRecommendations,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Check if response contains error
    if (response.data.error) {
      console.warn("RecommendationSystem returned error:", response.data.error);
      return {
        success: false,
        message: response.data.error,
        recommendations: [],
        total: 0,
      };
    }

    // Process successful response
    const recommendations = response.data.recommendations || [];
    return {
      success: true,
      recommendations: recommendations,
      total: recommendations.length,
    };
  } catch (error) {
    console.error("Error getting similar problems:", error);

    // Return fallback response on error
    return {
      success: false,
      message:
        error.response?.status === 404
          ? "Không tìm thấy bài toán tương tự cho bài này"
          : "Không thể lấy danh sách bài toán tương tự",
      recommendations: [],
      total: 0,
    };
  }
};

/**
 * Get next random problem from similar problems or fallback to all problems
 * Lấy bài toán ngẫu nhiên tiếp theo từ danh sách tương tự hoặc từ tất cả bài toán
 *
 * @param {string} problemTitle - Title of the current problem
 * @returns {Promise<Object>} Response containing next random problem
 */
export const getNextRandomProblem = async (problemTitle) => {
  try {
    // First try to get similar problems
    const similarResult = await getSimilarProblems(problemTitle, 10);

    if (similarResult.success && similarResult.recommendations.length > 0) {
      // Randomly select one from similar problems
      const randomIndex = Math.floor(
        Math.random() * similarResult.recommendations.length
      );
      const selectedProblem = similarResult.recommendations[randomIndex];

      return {
        success: true,
        problem: selectedProblem,
        source: "similar",
      };
    }

    // If no similar problems, return fallback indication
    return {
      success: false,
      message: "Không có bài toán tương tự, cần fallback",
      source: "fallback_needed",
    };
  } catch (error) {
    console.error("Error getting next random problem:", error);
    return {
      success: false,
      message: "Không thể lấy bài toán tiếp theo",
      source: "error",
    };
  }
};

/**
 * Check if RecommendationSystem is available
 * Kiểm tra xem RecommendationSystem có khả dụng không
 *
 * @returns {Promise<Object>} Health check response
 */
export const checkRecommendationSystemHealth = async () => {
  try {
    const response = await axios.get(`${RECOMMENDATION_API_URL}/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return {
      available: response.status === 200,
      url: RECOMMENDATION_API_URL,
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error("Error checking recommendation system health:", error);
    return {
      available: false,
      url: RECOMMENDATION_API_URL,
      error: error.message,
    };
  }
};

/**
 * Get random problem from all problems (fallback function)
 * Lấy bài toán ngẫu nhiên từ tất cả bài toán (hàm dự phòng)
 *
 * @param {Array} allProblems - Array of all available problems
 * @returns {Object|null} Random problem or null if no problems available
 */
export const getRandomProblemFromList = (allProblems) => {
  if (!allProblems || allProblems.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * allProblems.length);
  return allProblems[randomIndex];
};

/**
 * Format problem data for display
 * Định dạng dữ liệu bài toán để hiển thị
 *
 * @param {Object} problem - Problem object from API
 * @returns {Object} Formatted problem object
 */
export const formatProblemForDisplay = (problem) => {
  return {
    id: problem.id,
    title: problem.title || "Không có tiêu đề",
    description: problem.combined || problem.description || "Không có mô tả",
    // Extract first 100 characters for preview
    preview:
      (problem.combined || problem.description || "").substring(0, 100) +
      (problem.combined && problem.combined.length > 100 ? "..." : ""),
  };
};

/**
 * Cache management for recommendations
 * Quản lý cache cho các gợi ý
 */
export const recommendationCache = {
  // Cache key prefix
  CACHE_PREFIX: "recommendation_",

  // Cache duration in milliseconds (5 minutes)
  CACHE_DURATION: 5 * 60 * 1000,

  /**
   * Get cached recommendations
   * Lấy gợi ý từ cache
   */
  get: (problemTitle) => {
    try {
      const cacheKey = `${recommendationCache.CACHE_PREFIX}${problemTitle}`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const data = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is still valid
        if (now - data.timestamp < recommendationCache.CACHE_DURATION) {
          return data.recommendations;
        } else {
          // Remove expired cache
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error("Error reading from recommendation cache:", error);
    }

    return null;
  },

  /**
   * Set cached recommendations
   * Lưu gợi ý vào cache
   */
  set: (problemTitle, recommendations) => {
    try {
      const cacheKey = `${recommendationCache.CACHE_PREFIX}${problemTitle}`;
      const data = {
        recommendations,
        timestamp: Date.now(),
      };

      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error writing to recommendation cache:", error);
    }
  },

  /**
   * Clear all recommendation cache
   * Xóa tất cả cache gợi ý
   */
  clear: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(recommendationCache.CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error("Error clearing recommendation cache:", error);
    }
  },
};

/**
 * Get similar problems with caching
 * Lấy bài toán tương tự với cache
 */
export const getSimilarProblemsWithCache = async (
  problemTitle,
  numRecommendations = 5
) => {
  // Try to get from cache first
  const cached = recommendationCache.get(problemTitle);
  if (cached) {
    return {
      success: true,
      recommendations: cached.slice(0, numRecommendations),
      total: cached.length,
      fromCache: true,
    };
  }

  // Get from API if not in cache
  const result = await getSimilarProblems(problemTitle, numRecommendations);

  // Cache successful results
  if (result.success && result.recommendations) {
    recommendationCache.set(problemTitle, result.recommendations);
  }

  return result;
};
