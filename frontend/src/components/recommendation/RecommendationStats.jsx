import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { checkRecommendationSystemHealth } from "../../api/recommendationApi";

/**
 * Component to display recommendation system statistics and health
 * Component hiển thị thống kê và tình trạng hệ thống gợi ý
 */
const RecommendationStats = ({ className = "" }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const healthResult = await checkRecommendationSystemHealth();
      
      // Get cache statistics
      const cacheKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('recommendation_cache_')
      );
      
      const cacheStats = {
        totalCached: cacheKeys.length,
        cacheSize: cacheKeys.reduce((total, key) => {
          try {
            const data = localStorage.getItem(key);
            return total + (data ? data.length : 0);
          } catch {
            return total;
          }
        }, 0)
      };

      setStats({
        systemHealth: healthResult,
        cache: cacheStats,
        lastUpdated: new Date()
      });
    } catch (err) {
      console.error("Error fetching recommendation stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getTexts = () => {
    if (currentLanguage === "vi") {
      return {
        title: "Thống kê hệ thống gợi ý",
        systemStatus: "Trạng thái hệ thống",
        online: "Hoạt động",
        offline: "Không hoạt động",
        cacheInfo: "Thông tin cache",
        cachedProblems: "Bài toán đã cache",
        cacheSize: "Kích thước cache",
        lastUpdated: "Cập nhật lần cuối",
        refresh: "Làm mới",
        bytes: "bytes",
        kb: "KB",
        mb: "MB"
      };
    } else {
      return {
        title: "Recommendation System Stats",
        systemStatus: "System Status",
        online: "Online",
        offline: "Offline",
        cacheInfo: "Cache Information",
        cachedProblems: "Cached Problems",
        cacheSize: "Cache Size",
        lastUpdated: "Last Updated",
        refresh: "Refresh",
        bytes: "bytes",
        kb: "KB",
        mb: "MB"
      };
    }
  };

  const formatCacheSize = (bytes) => {
    const texts = getTexts();
    if (bytes < 1024) return `${bytes} ${texts.bytes}`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ${texts.kb}`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} ${texts.mb}`;
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString(currentLanguage === "vi" ? "vi-VN" : "en-US");
  };

  const texts = getTexts();

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
        <div className="text-center">
          <svg className="w-8 h-8 text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center">
          <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {texts.title}
        </h3>
        <button
          onClick={fetchStats}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          title={texts.refresh}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* System Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{texts.systemStatus}:</span>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              stats?.systemHealth?.available ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className={`font-medium ${
              stats?.systemHealth?.available ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats?.systemHealth?.available ? texts.online : texts.offline}
            </span>
          </div>
        </div>
      </div>

      {/* Cache Information */}
      <div className="space-y-2 text-sm">
        <h4 className="font-medium text-gray-700">{texts.cacheInfo}</h4>
        
        <div className="flex justify-between">
          <span className="text-gray-600">{texts.cachedProblems}:</span>
          <span className="font-medium">{stats?.cache?.totalCached || 0}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">{texts.cacheSize}:</span>
          <span className="font-medium">{formatCacheSize(stats?.cache?.cacheSize || 0)}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">{texts.lastUpdated}:</span>
          <span className="font-medium text-xs">
            {stats?.lastUpdated ? formatTime(stats.lastUpdated) : '-'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RecommendationStats;
