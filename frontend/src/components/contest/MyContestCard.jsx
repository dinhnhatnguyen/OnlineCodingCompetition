import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Users, Lock, Globe } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import Tooltip from "../ui/Tooltip";

const MyContestCard = ({ registration }) => {
  const { currentLanguage } = useLanguage();

  const translations = {
    vi: {
      viewContest: "Xem Chi Tiết",
      startTime: "Thời gian bắt đầu",
      endTime: "Thời gian kết thúc",
      status: "Trạng thái cuộc thi",
      participationStatus: "Trạng thái tham gia",
      approved: "Đã phê duyệt",
      pending: "Chờ phê duyệt",
      rejected: "Bị từ chối",
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      completed: "Đã kết thúc",
      public: "Công khai",
      private: "Riêng tư",
      score: "Điểm số",
      registeredAt: "Đăng ký lúc",
    },
    en: {
      viewContest: "View Details",
      startTime: "Start Time",
      endTime: "End Time",
      status: "Contest Status",
      participationStatus: "Participation Status",
      approved: "Approved",
      pending: "Pending",
      rejected: "Rejected",
      upcoming: "Upcoming",
      ongoing: "Ongoing",
      completed: "Completed",
      public: "Public",
      private: "Private",
      score: "Score",
      registeredAt: "Registered At",
    },
  };

  const t = translations[currentLanguage] || translations.en;

  const getContestStatus = () => {
    const now = new Date();
    const startTime = new Date(registration.contestStartTime);
    const endTime = new Date(registration.contestEndTime);

    if (now < startTime) return "upcoming";
    if (now >= startTime && now <= endTime) return "ongoing";
    return "completed";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "text-blue-400";
      case "ongoing":
        return "text-green-400";
      case "completed":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  const getParticipationStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "text-green-400";
      case "PENDING":
        return "text-yellow-400";
      case "REJECTED":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getParticipationStatusText = (status) => {
    switch (status) {
      case "APPROVED":
        return t.approved;
      case "PENDING":
        return t.pending;
      case "REJECTED":
        return t.rejected;
      default:
        return status;
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString(
      currentLanguage === "vi" ? "vi-VN" : "en-US"
    );
  };

  const contestStatus = getContestStatus();

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 group min-h-[420px] flex flex-col">
      <div className="mb-4 h-[80px] flex flex-col justify-start">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0 max-w-[calc(100%-120px)]">
            <Tooltip content={registration.contestTitle} position="top">
              <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors cursor-help contest-title-clamp">
                {registration.contestTitle}
              </h3>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {registration.contestPublic ? (
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

      <div className="mb-4 min-h-[48px]">
        {registration.contestDescription && (
          <Tooltip content={registration.contestDescription} position="bottom">
            <p className="text-gray-400 text-sm cursor-help contest-description-clamp">
              {registration.contestDescription}
            </p>
          </Tooltip>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-1 gap-3 mb-4">
          <div className="flex items-center text-sm">
            <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Calendar className="w-4 h-4 text-pink-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-gray-400 text-xs block">{t.startTime}</span>
              <span className="text-white font-medium text-sm truncate block">
                {formatDateTime(registration.contestStartTime)}
              </span>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-gray-400 text-xs block">{t.endTime}</span>
              <span className="text-white font-medium text-sm truncate block">
                {formatDateTime(registration.contestEndTime)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <span className="text-xs text-gray-400 block mb-1">{t.status}</span>
            <div
              className={`text-sm font-semibold ${getStatusColor(
                contestStatus
              )}`}
            >
              {t[contestStatus]}
            </div>
          </div>
          <div className="bg-zinc-800/50 rounded-lg p-3">
            <span className="text-xs text-gray-400 block mb-1">
              {t.participationStatus}
            </span>
            <div
              className={`text-sm font-semibold ${getParticipationStatusColor(
                registration.status
              )}`}
            >
              {getParticipationStatusText(registration.status)}
            </div>
          </div>
        </div>

        {registration.totalScore !== null &&
          registration.totalScore !== undefined && (
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg p-3 mb-4 border border-pink-500/20">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">{t.score}</span>
                <div className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {registration.totalScore.toFixed(2)}
                </div>
              </div>
            </div>
          )}

        <div className="mt-auto">
          <Link
            to={`/contests/${registration.contestId}`}
            className="block w-full text-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
          >
            {t.viewContest}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MyContestCard;
