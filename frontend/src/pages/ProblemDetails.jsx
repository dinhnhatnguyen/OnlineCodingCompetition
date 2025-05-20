import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { getProblems } from "../api/problemsApi";
import MonacoEditor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

const languageMap = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp",
};

const getTemplate = (problem, lang) => {
  if (!problem || !problem.functionSignatures) return "";
  const sig = problem.functionSignatures[lang];
  if (!sig) return "";
  let parsed = sig;
  if (typeof sig === "string") {
    try {
      parsed = JSON.parse(sig);
    } catch {
      return "";
    }
  }
  const paramTypes = parsed.parameterTypes || [];
  // Sinh tên biến tự động: a, b, c, ...
  const paramNames = paramTypes.map((_, i) => String.fromCharCode(97 + i));
  switch (lang) {
    case "javascript":
      return `function ${parsed.functionName}(${paramNames.join(
        ", "
      )}) {\n    // Write your code here\n}`;
    case "python":
      // Thêm annotation kiểu dữ liệu
      return `def ${parsed.functionName}(${paramNames
        .map((name, i) => `${name}: ${paramTypes[i]}`)
        .join(", ")}):\n    # Write your code here`;
    case "java":
      return `public class Solution {\n    public ${parsed.returnType} ${
        parsed.functionName
      }(${paramTypes
        .map((type, i) => `${type} ${paramNames[i]}`)
        .join(", ")}) {\n        // Write your code here\n    }\n}`;
    case "cpp":
      return `${parsed.returnType} ${parsed.functionName}(${paramTypes
        .map((type, i) => `${type} ${paramNames[i]}`)
        .join(", ")}) {\n    // Write your code here\n}`;
    default:
      return "";
  }
};

const ProblemDetails = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  useEffect(() => {
    getProblems()
      .then((data) => {
        const found = data.find((p) => String(p.id) === String(id));
        setProblem(found);
        setLoading(false);
        if (found) {
          setLanguage(Object.keys(found.functionSignatures)[0] || "javascript");
        }
      })
      .catch(() => {
        setError("Failed to load problem");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (problem) {
      setCode(getTemplate(problem, language));
    }
  }, [problem, language]);

  const handleSubmit = async () => {
    const payload = {
      problemId: problem.id,
      language,
      sourceCode: code,
    };
    // Ví dụ gửi POST, bạn có thể thay endpoint phù hợp
    try {
      const res = await fetch("http://localhost:8080/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Submit failed");
      alert("Submit thành công!");
    } catch {
      alert("Submit thất bại!");
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error || !problem)
    return (
      <div className="text-center py-10 text-red-500">Problem not found</div>
    );

  // Badge màu cho độ khó
  const getDifficultyBadge = (difficulty) => {
    switch ((difficulty || "").toLowerCase()) {
      case "easy":
        return (
          <span className="bg-green-600 text-white px-2 py-1 rounded text-xs ml-2">
            EASY
          </span>
        );
      case "medium":
        return (
          <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs ml-2">
            MEDIUM
          </span>
        );
      case "hard":
        return (
          <span className="bg-red-600 text-white px-2 py-1 rounded text-xs ml-2">
            HARD
          </span>
        );
      default:
        return null;
    }
  };

  // Lấy các test case ví dụ
  const exampleTestCases = (problem.testCases || []).filter(
    (tc) => tc.isExample
  );

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col md:flex-row gap-6 max-w-6xl mx-auto w-full py-8 px-2 md:px-0">
        {/* Left: Problem Description */}
        <section className="bg-zinc-900 rounded-lg p-6 flex-1 min-w-[340px] max-w-xl">
          <div className="flex items-center mb-2">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            {getDifficultyBadge(problem.difficulty)}
          </div>
          <div className="mb-4">
            <div className="prose prose-invert text-white">
              <ReactMarkdown>{problem.description}</ReactMarkdown>
            </div>
          </div>
          {exampleTestCases.length > 0 && (
            <div className="mb-4">
              <h2 className="font-bold mb-1">Example</h2>
              {exampleTestCases.map((tc) => {
                // Parse input/output
                let input = "";
                let output = "";
                try {
                  const inputArr = JSON.parse(tc.inputData);
                  input = inputArr.map((i) => i.input).join(", ");
                  const outputObj = JSON.parse(tc.expectedOutputData);
                  output = outputObj.expectedOutput;
                } catch {
                  // ignore
                }
                return (
                  <div key={tc.id} className="mb-2">
                    <div className="text-sm">
                      <span className="font-semibold">Input:</span> {input}
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">Output:</span> {output}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {problem.topics && problem.topics.length > 0 && (
            <div className="mb-2">
              <span className="font-semibold">Topics:</span>
              {problem.topics.map((t, i) => (
                <span
                  key={i}
                  className="ml-2 px-2 py-1 bg-zinc-800 text-gray-300 text-xs rounded"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {problem.constraints && (
            <div className="mt-2">
              <span className="font-semibold">Constraints</span>
              <div className="text-gray-300 text-xs whitespace-pre-line mt-1">
                {problem.constraints}
              </div>
            </div>
          )}
        </section>
        {/* Right: Code Editor */}
        <section className="bg-zinc-900 rounded-lg p-6 flex-1 min-w-[340px]">
          <div className="mb-2">
            <select
              className="bg-zinc-800 text-gray-300 rounded px-2 py-1"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {Object.keys(problem.functionSignatures).map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <MonacoEditor
            height="260px"
            language={languageMap[language] || "javascript"}
            theme="vs-dark"
            value={code}
            onChange={setCode}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
          <div className="flex gap-2 mb-2 mt-2">
            <button className="bg-zinc-700 text-white px-4 py-1 rounded">
              Reset
            </button>
            <button className="bg-green-700 text-white px-4 py-1 rounded">
              Run
            </button>
            <button
              className="bg-green-600 text-white px-4 py-1 rounded"
              onClick={handleSubmit}
            >
              Submit
            </button>
          </div>
          <div className="bg-zinc-800 rounded p-2 mt-2">
            <div className="flex gap-4 mb-2">
              <span className="font-semibold">Test Cases</span>
              <span className="text-gray-400">Console</span>
            </div>
            <div className="text-gray-400 text-sm">
              Run your code to see test results
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProblemDetails;
