import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Check, Circle, X } from "lucide-react";

const ProblemTable = ({ problems }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Filter problems based on search term and difficulty
  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (problem.topics &&
        problem.topics.some((topic) =>
          topic.toLowerCase().includes(searchTerm.toLowerCase())
        ));
    const matchesDifficulty =
      difficultyFilter === "all" ||
      (problem.difficulty &&
        problem.difficulty.toLowerCase() === difficultyFilter.toLowerCase());
    return matchesSearch && matchesDifficulty;
  });

  // Render status icon based on problem status
  const renderStatusIcon = (status) => {
    switch (status) {
      case "solved":
        return <Check className="h-5 w-5 text-green-500" />;
      case "attempted":
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-600 text-white";
      case "MEDIUM":
        return "bg-yellow-600 text-white";
      case "HARD":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  return (
    <div className="w-full max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Problems</h2>

        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-800 text-gray-300 text-sm p-2 pl-8 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 w-64"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>

          <select
            className="bg-zinc-800 text-gray-300 text-sm p-2 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 w-48"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">EASY</option>
            <option value="medium">MEDIUM</option>
            <option value="hard">HARD</option>
          </select>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-800">
            <thead className="bg-zinc-800">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Difficulty
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Topics
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider pr-4"
                >
                  Success Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredProblems.map((problem) => (
                <tr
                  key={problem.id}
                  className="hover:bg-zinc-800 cursor-pointer"
                  onClick={() => navigate(`/problems/${problem.id}`)}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    {renderStatusIcon(problem.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {problem.title}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${getDifficultyColor(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {problem.topics.map((topic, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-zinc-800 text-gray-300 text-xs rounded"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400 text-right pr-4">
                    {problem.successRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 text-gray-400 text-sm">
        <span>
          Showing 1 to {filteredProblems.length} of {problems.length} results
        </span>
        <div className="flex space-x-2">
          <button
            className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded hover:bg-zinc-700"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ←
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-pink-600 text-white rounded">
            1
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded hover:bg-zinc-700"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === Math.ceil(filteredProblems.length / 10)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProblemTable;
