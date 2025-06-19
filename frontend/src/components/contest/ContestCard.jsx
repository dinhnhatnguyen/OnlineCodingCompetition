import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useEffect, useState } from "react";
import { getRegistrations } from "../../api/contestRegistrationApi";
import ContestCountdown from "./ContestCountdown";
import { Lock, Globe, Calendar, Clock, Users } from "lucide-react";
import Tooltip from "../ui/Tooltip";

export default function ContestCard({ contest }) {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { currentLanguage } = useLanguage();
  const [userRegistration, setUserRegistration] = useState(null);
  const [loading, setLoading] = useState(false);

  const translations = {
    vi: {
      loading: "Đang tải...",
      register: "Đăng Ký",
      registrationPending: "Chờ Phê Duyệt",
      joinContest: "Tham Gia",
      viewDetails: "Xem Chi Tiết",
      viewResults: "Xem Kết Quả",
      comingSoon: "Sắp Ra Mắt",
      public: "Công Khai",
      private: "Riêng Tư",
      start: "Bắt đầu",
      end: "Kết thúc",
      participants: "Người tham gia",
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      completed: "Đã kết thúc",
      draft: "Bản nháp",
    },
    en: {
      loading: "Loading...",
      register: "Register",
      registrationPending: "Registration Pending",
      joinContest: "Join Contest",
      viewDetails: "View Details",
      viewResults: "View Results",
      comingSoon: "Coming Soon",
      public: "Public",
      private: "Private",
      start: "Start",
      end: "End",
      participants: "Participants",
      upcoming: "Upcoming",
      ongoing: "Ongoing",
      completed: "Completed",
      draft: "Draft",
    },
  };

  const t = translations[currentLanguage] || translations.en;

  useEffect(() => {
    // Check if user is registered for this contest
    const checkRegistration = async () => {
      if (user && token && contest.id) {
        setLoading(true);
        try {
          const registrations = await getRegistrations(contest.id, token);
          const userReg = registrations.find(
            (r) => r.username === user.username
          );
          setUserRegistration(userReg || null);
        } catch (error) {
          console.error("Error fetching registration status:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkRegistration();
  }, [user, token, contest.id]);

  const getStatusColor = () => {
    switch (contest.status) {
      case "ONGOING":
        return "bg-green-500";
      case "UPCOMING":
        return "bg-yellow-500";
      case "COMPLETED":
        return "bg-gray-500";
      case "DRAFT":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleButtonClick = (e) => {
    e.stopPropagation(); // Prevent navigating to details page when button is clicked

    if (contest.status === "ONGOING") {
      // Only allow users with approved registration to join
      if (userRegistration && userRegistration.status === "APPROVED") {
        navigate(`/contests/${contest.id}?tab=problems`);
      } else {
        // Show registration status or indicate they can't join
        navigate(`/contests/${contest.id}`);
      }
    } else {
      // For other statuses, just navigate to contest details
      navigate(`/contests/${contest.id}`);
    }
  };

  const getActionButton = () => {
    // If loading registration status
    if (loading) {
      return (
        <button
          className="bg-zinc-700 text-white rounded-lg px-6 py-3 w-full opacity-70 font-medium"
          disabled
        >
          {t.loading}
        </button>
      );
    }

    // For private contests in UPCOMING or ONGOING status
    if (
      (contest.status === "UPCOMING" || contest.status === "ONGOING") &&
      !contest.public
    ) {
      // If user is not registered or registration was rejected
      if (!userRegistration || userRegistration.status === "REJECTED") {
        return (
          <button
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg px-6 py-3 w-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={handleButtonClick}
          >
            {t.register}
          </button>
        );
      }

      // If registration is pending
      if (userRegistration.status === "PENDING") {
        return (
          <button
            className="bg-yellow-600 text-white rounded-lg px-6 py-3 w-full cursor-not-allowed font-medium opacity-80"
            disabled
          >
            {t.registrationPending}
          </button>
        );
      }

      // If registration is approved
      if (userRegistration.status === "APPROVED") {
        return (
          <button
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-6 py-3 w-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            onClick={handleButtonClick}
          >
            {contest.status === "ONGOING" ? t.joinContest : t.viewDetails}
          </button>
        );
      }
    }

    // For public contests or other cases
    if (contest.status === "ONGOING") {
      return (
        <button
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg px-6 py-3 w-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          onClick={handleButtonClick}
        >
          {t.joinContest}
        </button>
      );
    } else if (contest.status === "UPCOMING") {
      return (
        <button
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg px-6 py-3 w-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          onClick={handleButtonClick}
        >
          {t.viewDetails}
        </button>
      );
    } else if (contest.status === "COMPLETED") {
      return (
        <button
          className="bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg px-6 py-3 w-full font-medium transition-all duration-200"
          onClick={handleButtonClick}
        >
          {t.viewResults}
        </button>
      );
    } else {
      return (
        <button
          className="bg-zinc-700 text-white rounded-lg opacity-50 cursor-not-allowed px-6 py-3 w-full font-medium"
          disabled
        >
          {t.comingSoon}
        </button>
      );
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      UPCOMING: t.upcoming,
      ONGOING: t.ongoing,
      COMPLETED: t.completed,
      DRAFT: t.draft,
    };
    return statusMap[status] || status;
  };

  return (
    <div
      className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 cursor-pointer hover:border-pink-500/50 border border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 group h-[420px] flex flex-col"
      onClick={() => navigate(`/contests/${contest.id}`)}
    >
      {/* Header - Fixed Height */}
      <div className="mb-4 h-[80px] flex flex-col justify-start">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0 max-w-[calc(100%-120px)]">
            <Tooltip content={contest.title} position="top">
              <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors cursor-help contest-title-clamp">
                {contest.title}
              </h3>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()} text-white whitespace-nowrap`}
            >
              {getStatusText(contest.status)}
            </span>
            {contest.public ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                <Globe className="w-3 h-3" />
                <span>{t.public}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                <Lock className="w-3 h-3" />
                <span>{t.private}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description - Fixed Height */}
      <div className="mb-4 min-h-[48px]">
        <Tooltip content={contest.description} position="bottom">
          <p className="text-gray-400 text-sm cursor-help contest-description-clamp">
            {contest.description}
          </p>
        </Tooltip>
      </div>

      {/* Content - Flexible Height */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center text-sm">
            <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Calendar className="w-4 h-4 text-pink-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-gray-400 text-xs block">{t.start}</span>
              <span className="text-white font-medium text-sm truncate block">
                {new Date(contest.startTime).toLocaleString(
                  currentLanguage === "vi" ? "vi-VN" : "en-US"
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-gray-400 text-xs block">{t.end}</span>
              <span className="text-white font-medium text-sm truncate block">
                {new Date(contest.endTime).toLocaleString(
                  currentLanguage === "vi" ? "vi-VN" : "en-US"
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-gray-400 text-xs block">
                {t.participants}
              </span>
              <span className="text-white font-medium text-sm">
                {contest.currentParticipants}/{contest.maxParticipants || "∞"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button - Fixed at Bottom */}
        <div className="mt-auto">{getActionButton()}</div>
      </div>
    </div>
  );
}
