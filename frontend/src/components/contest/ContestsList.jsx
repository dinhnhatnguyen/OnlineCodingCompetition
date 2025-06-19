import React, { useState, useEffect } from "react";
import { Search, Plus, Users, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import ContestCard from "./ContestCard";
import MyContestCard from "./MyContestCard";
import { getContests, getMyContests } from "../../api/contestApi";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";

export default function ContestsList() {
  const { currentLanguage } = useLanguage();
  const { user, token } = useAuth();
  const [contests, setContests] = useState([]);
  const [myContests, setMyContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myContestsLoading, setMyContestsLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState("public"); // "public" or "my"
  const pageSize = 6;

  const translations = {
    vi: {
      title: "Danh Sách Cuộc Thi",
      publicContests: "Cuộc Thi Công Khai",
      myContests: "Cuộc Thi Của Tôi",
      joinContest: "Tham Gia Cuộc Thi",
      joinByCode: "Nhập Mã Cuộc Thi",
      searchPlaceholder: "Tìm kiếm cuộc thi...",
      allStatus: "Tất cả trạng thái",
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      completed: "Đã kết thúc",
      noContests: "Không tìm thấy cuộc thi nào",
      noContestsDesc:
        "Không có cuộc thi nào phù hợp với tiêu chí tìm kiếm. Hãy thử từ khóa khác.",
      noContestsDefault:
        "Hiện tại chưa có cuộc thi công khai nào. Hãy quay lại sau!",
      noMyContests: "Bạn chưa tham gia cuộc thi nào",
      noMyContestsDesc:
        "Hãy tham gia cuộc thi công khai hoặc sử dụng mã cuộc thi để tham gia cuộc thi riêng tư.",
      loginToViewMyContests: "Đăng nhập để xem cuộc thi của bạn",
      showing: "Hiển thị",
      to: "đến",
      of: "trong tổng số",
      results: "kết quả",
      participationStatus: "Trạng thái tham gia",
      approved: "Đã phê duyệt",
      pending: "Chờ phê duyệt",
      rejected: "Bị từ chối",
    },
    en: {
      title: "Contest List",
      publicContests: "Public Contests",
      myContests: "My Contests",
      joinContest: "Join Contest",
      joinByCode: "Enter Contest Code",
      searchPlaceholder: "Search contests...",
      allStatus: "All Status",
      upcoming: "Upcoming",
      ongoing: "Ongoing",
      completed: "Completed",
      noContests: "No contests found",
      noContestsDesc:
        "No contests match your search criteria. Try different keywords.",
      noContestsDefault:
        "No public contests available at the moment. Please check back later!",
      noMyContests: "You haven't joined any contests yet",
      noMyContestsDesc:
        "Join public contests or use a contest code to participate in private contests.",
      loginToViewMyContests: "Login to view your contests",
      showing: "Showing",
      to: "to",
      of: "of",
      results: "results",
      participationStatus: "Participation Status",
      approved: "Approved",
      pending: "Pending",
      rejected: "Rejected",
    },
  };

  const t = translations[currentLanguage] || translations.en;

  useEffect(() => {
    fetchPublicContests();
  }, []);

  useEffect(() => {
    if (activeTab === "my" && user && token) {
      fetchMyContests();
    }
  }, [activeTab, user, token]);

  const fetchPublicContests = () => {
    setLoading(true);
    getContests()
      .then((data) => {
        // Filter only public contests
        const publicContests = data.filter(
          (contest) => contest.public === true
        );
        setContests(publicContests);
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải danh sách cuộc thi");
        setLoading(false);
      });
  };

  const fetchMyContests = () => {
    setMyContestsLoading(true);
    getMyContests(token)
      .then((data) => {
        setMyContests(data);
        setMyContestsLoading(false);
      })
      .catch(() => {
        setMyContests([]);
        setMyContestsLoading(false);
      });
  };

  const getContestStatus = (contest) => {
    const now = new Date();
    const startTime = new Date(contest.startTime);
    const endTime = new Date(contest.endTime);

    if (now < startTime) return "upcoming";
    if (now >= startTime && now <= endTime) return "ongoing";
    return "completed";
  };

  const getFilteredContests = () => {
    const dataToFilter = activeTab === "public" ? contests : myContests;

    return dataToFilter.filter((item) => {
      // For "my" tab, item is a registration with contest info
      const contest =
        activeTab === "my"
          ? {
              title: item.contestTitle,
              description: item.contestDescription,
              startTime: item.contestStartTime,
              endTime: item.contestEndTime,
              status: item.contestStatus,
              public: item.contestPublic,
            }
          : item;

      // Search filter
      const matchesSearch =
        contest.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contest.description &&
          contest.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const contestStatus = getContestStatus(contest);
      const matchesStatus =
        statusFilter === "all" || contestStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  };

  const filteredContests = getFilteredContests();

  const totalPages = Math.ceil(filteredContests.length / pageSize);
  const paginatedContests = filteredContests.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const isLoading = activeTab === "public" ? loading : myContestsLoading;
  const hasError = activeTab === "public" ? error : false;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white py-10">
          {currentLanguage === "vi" ? "Đang tải..." : "Loading..."}
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500 py-10">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-white">{t.title}</h1>
            <p className="text-gray-400">
              {currentLanguage === "vi"
                ? "Khám phá và tham gia các cuộc thi lập trình"
                : "Discover and join programming contests"}
            </p>
          </div>
          <Link
            to="/contests/join"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            {t.joinContest}
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-8">
          <button
            onClick={() => setActiveTab("public")}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "public"
                ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            <Globe className="w-5 h-5 mr-2" />
            {t.publicContests}
          </button>
          <button
            onClick={() => setActiveTab("my")}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === "my"
                ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                : "bg-zinc-800 text-gray-300 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            <Users className="w-5 h-5 mr-2" />
            {t.myContests}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900 text-white pl-12 pr-4 py-3 rounded-lg border border-zinc-700 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 transition-all duration-200"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              className="bg-zinc-900 text-white px-4 py-3 rounded-lg border border-zinc-700 focus:outline-none focus:border-pink-500 appearance-none cursor-pointer min-w-[140px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t.allStatus}</option>
              <option value="upcoming">{t.upcoming}</option>
              <option value="ongoing">{t.ongoing}</option>
              <option value="completed">{t.completed}</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {activeTab === "my" && !user ? (
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-12 text-center border border-zinc-700">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {t.loginToViewMyContests}
            </h3>
            <p className="text-gray-400">
              {currentLanguage === "vi"
                ? "Đăng nhập để xem các cuộc thi bạn đã tham gia"
                : "Sign in to view your registered contests"}
            </p>
          </div>
        ) : paginatedContests.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
              {paginatedContests.map((item) =>
                activeTab === "public" ? (
                  <ContestCard key={item.id} contest={item} />
                ) : (
                  <MyContestCard key={item.id} registration={item} />
                )
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
              <span className="text-gray-400 text-sm">
                {t.showing}{" "}
                <span className="text-white font-medium">
                  {filteredContests.length === 0
                    ? 0
                    : currentPage * pageSize + 1}
                </span>{" "}
                {t.to}{" "}
                <span className="text-white font-medium">
                  {Math.min(
                    (currentPage + 1) * pageSize,
                    filteredContests.length
                  )}
                </span>{" "}
                {t.of}{" "}
                <span className="text-white font-medium">
                  {filteredContests.length}
                </span>{" "}
                {t.results}
              </span>
              <div className="flex space-x-2">
                <button
                  className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-all ${
                      currentPage === i
                        ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                        : "bg-zinc-800 hover:bg-zinc-700 text-gray-300 hover:text-white"
                    }`}
                    onClick={() => setCurrentPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-lg hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                >
                  &gt;
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-12 text-center border border-zinc-700">
            <div className="w-20 h-20 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              {activeTab === "my" ? (
                <Users className="w-10 h-10 text-white" />
              ) : (
                <Globe className="w-10 h-10 text-white" />
              )}
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">
              {activeTab === "my" ? t.noMyContests : t.noContests}
            </h3>
            <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
              {activeTab === "my"
                ? t.noMyContestsDesc
                : searchTerm
                ? t.noContestsDesc
                : t.noContestsDefault}
            </p>
            {activeTab === "my" && (
              <Link
                to="/contests/join"
                className="inline-flex items-center px-6 py-3 mt-6 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                {t.joinContest}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
