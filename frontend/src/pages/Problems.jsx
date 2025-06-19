import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { getProblems } from "../api/problemsApi";
import { getSolvedProblems } from "../api/solvedProblemsApi";
import { getAllTopics } from "../api/problemApi";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { safeAuthenticatedCall } from "../utils/authUtils";
import LanguageSwitcher from "../components/common/LanguageSwitcher";

const Problems = () => {
  const { currentLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solvedProblems, setSolvedProblems] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [availableTopics, setAvailableTopics] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách bài tập với ngôn ngữ hiện tại
        const problemsData = await getProblems(currentLanguage);
        setProblems(problemsData);

        // Lấy danh sách topics
        try {
          const topicsData = await getAllTopics();
          setAvailableTopics(topicsData);
        } catch (err) {
          console.error("Error fetching topics:", err);
          setAvailableTopics([]);
        }

        // Chỉ lấy danh sách bài đã giải nếu user đã đăng nhập
        try {
          const solvedData = await safeAuthenticatedCall(
            getSolvedProblems,
            user,
            logout
          );
          if (solvedData) {
            setSolvedProblems(new Set(solvedData));
          } else {
            setSolvedProblems(new Set());
          }
        } catch (err) {
          console.error("Error fetching solved problems:", err);
          setSolvedProblems(new Set());
        }
      } catch (error) {
        console.error("Error loading problems:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentLanguage, user]); // Re-fetch when language or user changes

  // Filter problems based on search, difficulty, and topic
  const filteredProblems = problems.filter((problem) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      problem.title.toLowerCase().includes(searchQuery.toLowerCase());

    // Difficulty filter
    const matchesDifficulty =
      difficultyFilter === "all" ||
      problem.difficulty.toLowerCase() === difficultyFilter;

    // Topic filter
    const matchesTopic =
      topicFilter === "all" ||
      (problem.topics && problem.topics.includes(topicFilter));

    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  // Translations
  const translations = {
    vi: {
      title: "Bài tập",
      search: "Tìm kiếm...",
      allDifficulties: "Tất cả độ khó",
      easy: "Dễ",
      medium: "Trung bình",
      hard: "Khó",
      allTopics: "Tất cả chủ đề",
      status: "Trạng thái",
      problemTitle: "Tiêu đề",
      difficulty: "Độ khó",
      topics: "Chủ đề",
      successRate: "Tỷ lệ thành công",
      noResults: "Không tìm thấy bài tập nào phù hợp",
      showing: "Hiển thị",
      to: "đến",
      of: "trong tổng số",
      results: "kết quả",
      loading: "Đang tải...",
    },
    en: {
      title: "Problems",
      search: "Search...",
      allDifficulties: "All Difficulties",
      easy: "Easy",
      medium: "Medium",
      hard: "Hard",
      allTopics: "All Topics",
      status: "Status",
      problemTitle: "Title",
      difficulty: "Difficulty",
      topics: "Topics",
      successRate: "Success Rate",
      noResults: "No problems found matching your criteria",
      showing: "Showing",
      to: "to",
      of: "of",
      results: "results",
      loading: "Loading...",
    },
  };

  const t = translations[currentLanguage] || translations.en;

  // Get difficulty badge style
  const getDifficultyBadge = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-600 text-white";
      case "medium":
        return "bg-yellow-600 text-white";
      case "hard":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  if (loading)
    return (
      <div className="bg-black text-white min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-10">{t.loading}</div>
        </div>
        <Footer />
      </div>
    );

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t.title}</h1>

          <div className="flex gap-3 items-center">
            {/* Language Switcher for page */}
            <LanguageSwitcher variant="compact" />
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
                placeholder={t.search}
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
              <option value="all">{t.allDifficulties}</option>
              <option value="easy">{t.easy}</option>
              <option value="medium">{t.medium}</option>
              <option value="hard">{t.hard}</option>
            </select>

            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="bg-zinc-900 text-white px-4 py-2 rounded border border-zinc-700 focus:outline-none appearance-none"
            >
              <option value="all">{t.allTopics}</option>
              {availableTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-gray-400 text-left text-sm uppercase">
                <th className="py-3 px-6">{t.status}</th>
                <th className="py-3 px-6">{t.problemTitle}</th>
                <th className="py-3 px-6">{t.difficulty}</th>
                <th className="py-3 px-6">{t.topics}</th>
                <th className="py-3 px-6 text-right">{t.successRate}</th>
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
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(
                        problem.difficulty
                      )}`}
                    >
                      {problem.difficulty.toLowerCase()}
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
                    {t.noResults}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
          <div>
            {t.showing} 1 {t.to} {filteredProblems.length} {t.of}{" "}
            {problems.length} {t.results}
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
