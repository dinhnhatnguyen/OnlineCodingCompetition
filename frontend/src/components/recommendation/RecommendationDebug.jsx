import React, { useState } from "react";
import { useRecommendations, useRecommendationCache } from "../../hooks/useRecommendations";
import { checkRecommendationSystemHealth } from "../../api/recommendationApi";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * Debug component for recommendation system
 * Component debug cho hệ thống gợi ý
 */
const RecommendationDebug = ({ problemTitle, currentProblemId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const { currentLanguage } = useLanguage();
  
  const {
    similarProblems,
    loading,
    error,
    systemStatus,
    fetchSimilarProblems,
    getNextProblem,
    checkSystemHealth,
    hasSimilarProblems,
    isSystemAvailable,
  } = useRecommendations(problemTitle, currentProblemId);

  const {
    cacheSize,
    clearCache,
    getCacheInfo,
  } = useRecommendationCache();

  const runTests = async () => {
    setTestResults({ running: true });
    const results = {};

    try {
      // Test 1: System Health
      console.log("Testing system health...");
      const healthResult = await checkRecommendationSystemHealth();
      results.health = healthResult;

      // Test 2: Similar Problems
      if (problemTitle) {
        console.log("Testing similar problems...");
        await fetchSimilarProblems(5);
        results.similarProblems = {
          count: similarProblems.length,
          hasResults: hasSimilarProblems,
        };
      }

      // Test 3: Next Problem
      if (problemTitle) {
        console.log("Testing next problem...");
        const nextResult = await getNextProblem();
        results.nextProblem = nextResult;
      }

      // Test 4: Cache Info
      const cacheInfo = getCacheInfo();
      results.cache = cacheInfo;

      setTestResults({ ...results, success: true });
    } catch (error) {
      console.error("Test error:", error);
      setTestResults({ ...results, error: error.message, success: false });
    }
  };

  const getTexts = () => {
    if (currentLanguage === "vi") {
      return {
        title: "Debug Hệ thống Gợi ý",
        runTests: "Chạy Test",
        clearCache: "Xóa Cache",
        systemHealth: "Tình trạng hệ thống",
        cacheInfo: "Thông tin Cache",
        testResults: "Kết quả Test",
        available: "Khả dụng",
        unavailable: "Không khả dụng",
        entries: "mục",
        expired: "hết hạn",
      };
    } else {
      return {
        title: "Recommendation System Debug",
        runTests: "Run Tests",
        clearCache: "Clear Cache",
        systemHealth: "System Health",
        cacheInfo: "Cache Info",
        testResults: "Test Results",
        available: "Available",
        unavailable: "Unavailable",
        entries: "entries",
        expired: "expired",
      };
    }
  };

  const texts = getTexts();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title={texts.title}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{texts.title}</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* System Status */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">{texts.systemHealth}</h4>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isSystemAvailable ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">
            {isSystemAvailable ? texts.available : texts.unavailable}
          </span>
        </div>
        {systemStatus?.error && (
          <p className="text-xs text-red-600 mt-1">{systemStatus.error}</p>
        )}
      </div>

      {/* Cache Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-700">{texts.cacheInfo}</h4>
          <button
            onClick={clearCache}
            className="text-xs text-red-600 hover:text-red-800"
          >
            {texts.clearCache}
          </button>
        </div>
        <p className="text-sm text-gray-600">
          {cacheSize} {texts.entries}
        </p>
      </div>

      {/* Current State */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Current State</h4>
        <div className="text-xs space-y-1">
          <div>Loading: {loading ? 'Yes' : 'No'}</div>
          <div>Error: {error || 'None'}</div>
          <div>Similar Problems: {similarProblems.length}</div>
          <div>Problem Title: {problemTitle || 'None'}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button
          onClick={runTests}
          disabled={testResults?.running}
          className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 disabled:bg-blue-300"
        >
          {testResults?.running ? 'Running...' : texts.runTests}
        </button>
      </div>

      {/* Test Results */}
      {testResults && !testResults.running && (
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
          <h4 className="font-medium mb-2">{texts.testResults}</h4>
          <pre className="whitespace-pre-wrap text-xs overflow-x-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default RecommendationDebug;
