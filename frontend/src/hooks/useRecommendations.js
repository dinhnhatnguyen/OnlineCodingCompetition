import { useState, useEffect, useCallback } from "react";
import { 
  getSimilarProblemsWithCache, 
  getNextRandomProblem,
  checkRecommendationSystemHealth,
  recommendationCache 
} from "../api/recommendationApi";

/**
 * Custom hook for managing recommendation state and operations
 * Hook tùy chỉnh để quản lý trạng thái và thao tác gợi ý
 */
export const useRecommendations = (problemTitle, currentProblemId) => {
  const [similarProblems, setSimilarProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);

  // Fetch similar problems
  const fetchSimilarProblems = useCallback(async (maxRecommendations = 5) => {
    if (!problemTitle) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getSimilarProblemsWithCache(problemTitle, maxRecommendations);
      
      if (result.success && result.recommendations) {
        // Filter out current problem
        const filteredProblems = result.recommendations
          .filter(problem => problem.id !== currentProblemId);
        
        setSimilarProblems(filteredProblems);
      } else {
        setError(result.message || "Không thể tải danh sách bài toán tương tự");
        setSimilarProblems([]);
      }
    } catch (err) {
      console.error("Error fetching similar problems:", err);
      setError("Lỗi khi tải danh sách bài toán tương tự");
      setSimilarProblems([]);
    } finally {
      setLoading(false);
    }
  }, [problemTitle, currentProblemId]);

  // Get next random problem
  const getNextProblem = useCallback(async () => {
    if (!problemTitle) return null;

    try {
      const result = await getNextRandomProblem(problemTitle);
      return result;
    } catch (error) {
      console.error("Error getting next problem:", error);
      return {
        success: false,
        message: "Không thể lấy bài toán tiếp theo",
      };
    }
  }, [problemTitle]);

  // Check system health
  const checkSystemHealth = useCallback(async () => {
    try {
      const result = await checkRecommendationSystemHealth();
      setSystemStatus(result);
      return result;
    } catch (error) {
      const errorStatus = {
        available: false,
        error: error.message,
      };
      setSystemStatus(errorStatus);
      return errorStatus;
    }
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    recommendationCache.clear();
  }, []);

  // Retry fetching similar problems
  const retry = useCallback(() => {
    fetchSimilarProblems();
  }, [fetchSimilarProblems]);

  // Auto-fetch similar problems when problemTitle changes
  useEffect(() => {
    if (problemTitle) {
      fetchSimilarProblems();
    }
  }, [fetchSimilarProblems]);

  // Check system health on mount
  useEffect(() => {
    checkSystemHealth();
  }, [checkSystemHealth]);

  return {
    // State
    similarProblems,
    loading,
    error,
    systemStatus,
    
    // Actions
    fetchSimilarProblems,
    getNextProblem,
    checkSystemHealth,
    clearCache,
    retry,
    
    // Computed values
    hasSimilarProblems: similarProblems.length > 0,
    isSystemAvailable: systemStatus?.available === true,
  };
};

/**
 * Hook for managing recommendation cache
 * Hook để quản lý cache gợi ý
 */
export const useRecommendationCache = () => {
  const [cacheSize, setCacheSize] = useState(0);

  const updateCacheSize = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(recommendationCache.CACHE_PREFIX));
      setCacheSize(cacheKeys.length);
    } catch (error) {
      console.error("Error calculating cache size:", error);
      setCacheSize(0);
    }
  }, []);

  const clearCache = useCallback(() => {
    recommendationCache.clear();
    updateCacheSize();
  }, [updateCacheSize]);

  const getCacheInfo = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(recommendationCache.CACHE_PREFIX));
      
      const cacheEntries = cacheKeys.map(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          const problemTitle = key.replace(recommendationCache.CACHE_PREFIX, '');
          const age = Date.now() - data.timestamp;
          const isExpired = age > recommendationCache.CACHE_DURATION;
          
          return {
            problemTitle,
            timestamp: data.timestamp,
            age,
            isExpired,
            recommendationsCount: data.recommendations?.length || 0,
          };
        } catch (error) {
          return null;
        }
      }).filter(Boolean);

      return {
        totalEntries: cacheEntries.length,
        entries: cacheEntries,
        expiredEntries: cacheEntries.filter(entry => entry.isExpired).length,
      };
    } catch (error) {
      console.error("Error getting cache info:", error);
      return {
        totalEntries: 0,
        entries: [],
        expiredEntries: 0,
      };
    }
  }, []);

  useEffect(() => {
    updateCacheSize();
  }, [updateCacheSize]);

  return {
    cacheSize,
    clearCache,
    getCacheInfo,
    updateCacheSize,
  };
};
