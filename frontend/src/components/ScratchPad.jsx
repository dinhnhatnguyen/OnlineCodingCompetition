import React, { useState, useEffect } from "react";
import { runScratchCode } from "../api/codeApi";
import CodeEditor from "./problem/CodeEditor";
import {
  FaPlay,
  FaCode,
  FaFileDownload,
  FaCopy,
  FaTrash,
} from "react-icons/fa";
import { BiCodeBlock } from "react-icons/bi";

// Code templates cho mỗi ngôn ngữ
const CODE_TEMPLATES = {
  cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

int main() {
    // Đoạn code này sẽ chạy khi bạn nhấn "Chạy code"
    
    // Ví dụ đọc input
    int a, b;
    cin >> a >> b;
    
    // Xử lý và in output
    cout << "Tổng: " << (a + b) << endl;
    
    return 0;
}`,
  java: `public class Solution {
    public static void main(String[] args) {
        // Đoạn code này sẽ chạy khi bạn nhấn "Chạy code"
        
        // Ví dụ đọc input bằng Scanner
        java.util.Scanner scanner = new java.util.Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        
        // Xử lý và in output
        System.out.println("Tổng: " + (a + b));
        
        scanner.close();
    }
}`,
  python: `# Đoạn code này sẽ chạy khi bạn nhấn "Chạy code"

# Ví dụ đọc input
a, b = map(int, input().split())

# Xử lý và in output
print(f"Tổng: {a + b}")
`,
  javascript: `// Đoạn code này sẽ chạy khi bạn nhấn "Chạy code"

// Ví dụ đọc input từ stdin
process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputString = '';
process.stdin.on('data', (chunk) => {
    inputString += chunk;
});

process.stdin.on('end', () => {
    const values = inputString.trim().split(' ').map(Number);
    const a = values[0];
    const b = values[1];
    
    // Xử lý và in output
    console.log('Tổng:', a + b);
});
`,
};

const ScratchPad = () => {
  const [code, setCode] = useState("");
  const [input, setInput] = useState("5 3");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [isRunning, setIsRunning] = useState(false);
  const [runtime, setRuntime] = useState(null);
  const [memory, setMemory] = useState(null);
  const [fileName, setFileName] = useState("code");

  // Khi ngôn ngữ thay đổi, cập nhật code template
  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(CODE_TEMPLATES[newLang]);

    // Cập nhật tên file mặc định theo ngôn ngữ
    const defaultFileNames = {
      cpp: "main",
      java: "Solution",
      python: "solution",
      javascript: "script",
    };
    setFileName(defaultFileNames[newLang] || "code");
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setError("");
    setOutput("");
    setRuntime(null);
    setMemory(null);

    try {
      const result = await runScratchCode(code, language, input);

      if (result.status === "COMPILE_ERROR" || result.status === "ERROR") {
        setError(result.errorMessage || "Có lỗi xảy ra khi chạy code");
      } else {
        setOutput(result.output || "");
        setRuntime(result.runtime);
        setMemory(result.memory);
      }
    } catch (error) {
      setError(error.message || "Có lỗi xảy ra khi chạy code");
    } finally {
      setIsRunning(false);
    }
  };

  const clearCode = () => {
    setCode(CODE_TEMPLATES[language]);
  };

  const clearOutput = () => {
    setOutput("");
    setError("");
    setRuntime(null);
    setMemory(null);
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const extension =
      language === "cpp"
        ? ".cpp"
        : language === "java"
        ? ".java"
        : language === "python"
        ? ".py"
        : ".js";

    const file = new Blob([code], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = fileName + extension;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output || error || "");
  };

  // Khởi tạo code mẫu khi component được load
  useEffect(() => {
    setCode(CODE_TEMPLATES[language]);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <BiCodeBlock size={24} className="mr-2 text-blue-400" />
          <h1 className="text-xl font-bold text-white">Code Scratch Pad</h1>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="bg-zinc-700 text-white px-3 py-1.5 rounded-l border border-zinc-600 w-28 text-sm hidden sm:block"
            placeholder="Tên file"
          />
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-zinc-700 border border-zinc-600 rounded px-3 py-1.5 text-sm text-white"
          >
            <option value="cpp">C++</option>
            {/* <option value="java">Java</option> */}
            <option value="python">Python</option>
            {/* <option value="javascript">JavaScript</option> */}
          </select>

          <button
            onClick={downloadCode}
            className="hidden sm:flex items-center px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-sm text-white border border-zinc-600"
            title="Tải code"
          >
            <FaFileDownload className="mr-1" /> Tải code
          </button>

          <button
            onClick={clearCode}
            className="hidden sm:flex items-center px-3 py-1.5 rounded bg-zinc-700 hover:bg-zinc-600 text-sm text-white border border-zinc-600"
            title="Xóa code"
          >
            <FaTrash className="mr-1" /> Xóa code
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow">
        {/* Left column: Code editor and input */}
        <div className="flex flex-col h-full">
          {/* Code Editor */}
          <div
            className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden flex-grow"
            style={{ minHeight: "600px" }}
          >
            <div className="p-3 border-b border-zinc-700 bg-zinc-900 flex items-center">
              <FaCode className="mr-2 text-blue-400" />
              <h2 className="text-sm font-semibold text-white">Code Editor</h2>
            </div>
            <div className="h-full">
              <CodeEditor
                language={language}
                value={code}
                onChange={setCode}
                height="550px"
                options={{
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  fontSize: 14,
                  minimap: { enabled: false },
                }}
                hideLanguageSelector={true}
              />
            </div>
          </div>

          {/* Input */}
          <div className="mt-4 bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="p-3 border-b border-zinc-700 bg-zinc-900">
              <span className="text-sm font-semibold text-white">Input</span>
            </div>
            <div className="p-0">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập dữ liệu đầu vào tại đây..."
                className="w-full bg-transparent p-3 resize-none h-32 focus:outline-none text-white"
              />
            </div>
          </div>
        </div>

        {/* Right column: Output and run button */}
        <div className="flex flex-col h-full">
          {/* Output */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden flex-grow">
            <div className="p-3 border-b border-zinc-700 bg-zinc-900 flex justify-between">
              <span className="text-sm font-semibold text-white">Output</span>
              <div className="flex space-x-2">
                <button
                  onClick={copyOutput}
                  className="text-zinc-400 hover:text-white"
                  title="Sao chép"
                >
                  <FaCopy />
                </button>
                <button
                  onClick={clearOutput}
                  className="text-zinc-400 hover:text-white"
                  title="Xóa"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="p-3 h-full overflow-y-auto">
              {error ? (
                <div className="text-red-400 whitespace-pre-wrap font-mono">
                  {error}
                </div>
              ) : output ? (
                <>
                  <pre className="whitespace-pre-wrap mb-3 font-mono text-white">
                    {output}
                  </pre>
                  {runtime !== null && memory !== null && (
                    <div className="text-xs text-zinc-400 mt-2 p-2 border border-zinc-700 rounded bg-zinc-900">
                      <span className="block">⏱️ Runtime: {runtime}ms</span>
                      <span className="block">💾 Memory: {memory}KB</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-zinc-500 italic">
                  Kết quả sẽ hiển thị tại đây
                </div>
              )}
            </div>
          </div>

          {/* Run button */}
          <div className="mt-4">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className={`w-full flex justify-center items-center py-3 rounded-lg text-base font-medium ${
                isRunning
                  ? "bg-blue-800 opacity-70 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {isRunning ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang chạy code...
                </>
              ) : (
                <>
                  <FaPlay className="mr-2" /> Run Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchPad;
