import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { getProblems } from "../api/problemsApi";
import { getSolvedProblems } from "../api/solvedProblemsApi";

const Problems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("All Difficulties");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách bài tập
        const problemsData = await getProblems();
        setProblems(problemsData);

        try {
          // Lấy danh sách bài đã giải
          const solvedData = await getSolvedProblems();
          setSolvedProblems(new Set(solvedData));
        } catch (err) {
          console.error("Error fetching solved problems:", err);
        }
      } catch (error) {
        console.error("Error loading problems:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter problems based on search and difficulty
  const filteredProblems = problems.filter((problem) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      problem.title.toLowerCase().includes(searchQuery.toLowerCase());

    // Difficulty filter
    const matchesDifficulty =
      difficultyFilter === "All Difficulties" ||
      problem.difficulty === difficultyFilter.toUpperCase();

    return matchesSearch && matchesDifficulty;
  });

  if (loading)
    return (
      <div className="bg-black text-white min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-10">Loading...</div>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Problems</h1>

          <div className="flex gap-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="bg-zinc-900 text-white pl-10 pr-3 py-2 rounded w-72 focus:outline-none border border-zinc-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-zinc-900 text-white px-4 py-2 rounded border border-zinc-700 focus:outline-none appearance-none"
            >
              <option>All Difficulties</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-gray-400 text-left text-sm uppercase">
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Difficulty</th>
                <th className="py-3 px-6">Topics</th>
                <th className="py-3 px-6 text-right">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((problem) => (
                <tr
                  key={problem.id}
                  className="border-b border-zinc-800 hover:bg-zinc-800/50"
                >
                  <td className="py-4 px-6">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        solvedProblems.has(problem.id)
                          ? "border-green-500"
                          : "border border-gray-500"
                      }`}
                    >
                      {solvedProblems.has(problem.id) && (
                        <svg
                          className="w-4 h-4 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Link
                      to={`/problems/${problem.id}`}
                      className="text-white hover:text-blue-400"
                    >
                      {problem.title}
                    </Link>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        problem.difficulty === "EASY"
                          ? "bg-green-600"
                          : problem.difficulty === "MEDIUM"
                          ? "bg-yellow-600"
                          : "bg-red-600"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {problem.topics &&
                        problem.topics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="bg-zinc-800 text-gray-300 px-2 py-0.5 text-xs rounded"
                          >
                            {topic}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {problem.successRate ||
                      `${Math.floor(Math.random() * 30 + 70)}%`}
                  </td>
                </tr>
              ))}
              {filteredProblems.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-500">
                    No problems match your search
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
          <div>
            Showing 1 to {filteredProblems.length} of {problems.length} results
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
              disabled
            >
              &lt;
            </button>
            <button className="px-3 py-1 rounded bg-pink-600 hover:bg-pink-700 text-white">
              1
            </button>
            <button className="px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700">
              &gt;
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Problems;
