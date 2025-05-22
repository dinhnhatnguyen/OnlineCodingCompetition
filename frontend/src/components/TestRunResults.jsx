import React, { useState } from "react";

const TestRunResults = ({ results }) => {
  const [currentTestIndex, setCurrentTestIndex] = useState(0);

  if (!results) return null;

  const hasTestResults = results.results && results.results.length > 0;

  // Tính tổng số test pass/fail
  const passedCount = hasTestResults
    ? results.results.filter((r) => r.status === "PASSED").length
    : 0;

  const handlePrevTest = () => {
    setCurrentTestIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextTest = () => {
    setCurrentTestIndex((prev) =>
      Math.min(results.results.length - 1, prev + 1)
    );
  };

  return (
    <div className="bg-zinc-800 p-4 rounded">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Test Results</h3>
        {hasTestResults && (
          <div className="text-sm">
            <span
              className={
                passedCount === results.results.length
                  ? "text-green-400"
                  : "text-yellow-400"
              }
            >
              {passedCount}/{results.results.length} tests passed
            </span>
          </div>
        )}
      </div>

      {results.status === "COMPILE_ERROR" && (
        <div className="bg-red-900/50 p-3 rounded mb-3 text-white">
          <h4 className="font-bold">Compile Error:</h4>
          <pre className="whitespace-pre-wrap text-sm overflow-x-auto max-h-60">
            {results.compileError}
          </pre>
        </div>
      )}

      {hasTestResults ? (
        <div className="mb-3">
          {/* Navigation controls */}
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium">
              Test Case {currentTestIndex + 1} of {results.results.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevTest}
                disabled={currentTestIndex === 0}
                className={`px-3 py-1 rounded ${
                  currentTestIndex === 0
                    ? "bg-zinc-700 text-zinc-500"
                    : "bg-zinc-700 hover:bg-zinc-600"
                }`}
              >
                Prev
              </button>
              <button
                onClick={handleNextTest}
                disabled={currentTestIndex === results.results.length - 1}
                className={`px-3 py-1 rounded ${
                  currentTestIndex === results.results.length - 1
                    ? "bg-zinc-700 text-zinc-500"
                    : "bg-zinc-700 hover:bg-zinc-600"
                }`}
              >
                Next
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-900 h-1.5 mb-3 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-in-out"
              style={{
                width: `${
                  ((currentTestIndex + 1) / results.results.length) * 100
                }%`,
                backgroundColor:
                  results.results[currentTestIndex].status === "PASSED"
                    ? "#34D399"
                    : "#F87171",
              }}
            />
          </div>

          {/* Current test case */}
          <div
            key={currentTestIndex}
            className={`p-3 rounded ${
              results.results[currentTestIndex].status === "PASSED"
                ? "bg-green-900/30 border border-green-700"
                : "bg-red-900/30 border border-red-700"
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    results.results[currentTestIndex].status === "PASSED"
                      ? "bg-green-700"
                      : "bg-red-700"
                  }`}
                >
                  {results.results[currentTestIndex].status}
                </span>
              </div>
              <div className="text-xs">
                <span className="mr-3">
                  Runtime: {results.results[currentTestIndex].runtime}ms
                </span>
                <span>
                  Memory: {results.results[currentTestIndex].memory}KB
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="break-all">
                <div className="font-semibold mb-1">Input:</div>
                <pre className="bg-black/30 p-2 rounded overflow-auto max-h-32">
                  {results.results[currentTestIndex].input}
                </pre>
              </div>

              <div className="break-all">
                <div className="font-semibold mb-1">Expected:</div>
                <pre className="bg-black/30 p-2 rounded overflow-auto max-h-32">
                  {results.results[currentTestIndex].expectedOutput}
                </pre>
              </div>

              <div className="break-all">
                <div className="font-semibold mb-1">Your Output:</div>
                <pre
                  className={`p-2 rounded overflow-auto max-h-32 ${
                    results.results[currentTestIndex].status === "PASSED"
                      ? "bg-black/30"
                      : "bg-red-800/30"
                  }`}
                >
                  {results.results[currentTestIndex].actualOutput || ""}
                </pre>
              </div>
            </div>

            {results.results[currentTestIndex].errorMessage && (
              <div className="mt-2">
                <div className="font-semibold">Error:</div>
                <pre className="bg-red-900/50 p-2 rounded text-xs overflow-auto max-h-32">
                  {results.results[currentTestIndex].errorMessage}
                </pre>
                {(
                  results.results[currentTestIndex].errorMessage || ""
                ).includes("Vượt quá giới hạn bộ nhớ") && (
                  <div className="mt-2 text-yellow-400 text-sm">
                    <strong>Gợi ý:</strong> Mã của bạn có thể đang sử dụng quá
                    nhiều bộ nhớ. Hãy xem xét:
                    <ul className="list-disc pl-4 mt-1">
                      <li>Tránh tạo mảng hoặc chuỗi rất lớn</li>
                      <li>
                        Tránh đệ quy sâu mà không có điều kiện dừng phù hợp
                      </li>
                      <li>Giải phóng tài nguyên không cần thiết</li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-yellow-400">No test results available.</div>
      )}

      {results.status === "ERROR" && (
        <div className="bg-red-900/50 p-3 rounded mb-3">
          <h4 className="font-bold">Lỗi hệ thống:</h4>
          <p className="whitespace-pre-wrap text-sm mb-1">
            {results.compileError || "Đã xảy ra lỗi không xác định"}
          </p>
          {(results.compileError || "").includes("đăng nhập") && (
            <p className="text-yellow-400 mt-2 text-sm">
              <strong>Gợi ý:</strong> Bạn cần đăng nhập để chạy code. Nếu đã
              đăng nhập, có thể phiên đăng nhập đã hết hạn, vui lòng đăng nhập
              lại.
            </p>
          )}
          {((results.compileError || "")
            .toLowerCase()
            .includes("out of memory") ||
            (results.compileError || "").toLowerCase().includes("oom") ||
            (results.compileError || "").includes(
              "Vượt quá giới hạn bộ nhớ"
            )) && (
            <div className="mt-2 text-yellow-400 text-sm">
              <strong>Gợi ý:</strong> Code của bạn đã vượt quá giới hạn bộ nhớ.
              Hãy xem xét:
              <ul className="list-disc pl-4 mt-1">
                <li>Tránh tạo mảng hoặc chuỗi rất lớn</li>
                <li>Tránh đệ quy sâu mà không có điều kiện dừng phù hợp</li>
                <li>Giải phóng tài nguyên không cần thiết</li>
                <li>Sử dụng thuật toán hiệu quả hơn về bộ nhớ</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestRunResults;
