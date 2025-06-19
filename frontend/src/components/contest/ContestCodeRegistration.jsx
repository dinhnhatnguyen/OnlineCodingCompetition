import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../../contexts/ToastContext";
import { getContestByCode, registerByContestCode } from "../../api/contestApi";

const ContestCodeRegistration = ({ onSuccess }) => {
  const { user, token } = useAuth();
  const { currentLanguage } = useLanguage();
  const { showToast } = useToast();
  
  const [contestCode, setContestCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [contest, setContest] = useState(null);
  const [step, setStep] = useState("input"); // "input", "preview", "success"

  const translations = {
    vi: {
      title: "Tham gia cuộc thi bằng mã",
      subtitle: "Nhập mã cuộc thi để tham gia",
      codePlaceholder: "Nhập mã cuộc thi (6-8 ký tự)",
      findContest: "Tìm cuộc thi",
      contestFound: "Tìm thấy cuộc thi",
      contestTitle: "Tiêu đề cuộc thi",
      contestDescription: "Mô tả",
      startTime: "Thời gian bắt đầu",
      endTime: "Thời gian kết thúc",
      maxParticipants: "Số người tham gia tối đa",
      currentParticipants: "Đã đăng ký",
      status: "Trạng thái",
      register: "Đăng ký tham gia",
      registering: "Đang đăng ký...",
      back: "Quay lại",
      success: "Đăng ký thành công!",
      successMessage: "Bạn đã đăng ký thành công vào cuộc thi. Vui lòng chờ admin phê duyệt.",
      goToContest: "Đi đến cuộc thi",
      loginRequired: "Vui lòng đăng nhập để tham gia cuộc thi",
      invalidCode: "Mã cuộc thi không hợp lệ",
      contestNotFound: "Không tìm thấy cuộc thi với mã này",
      registrationFailed: "Đăng ký thất bại",
      alreadyRegistered: "Bạn đã đăng ký cuộc thi này rồi",
    },
    en: {
      title: "Join Contest by Code",
      subtitle: "Enter contest code to participate",
      codePlaceholder: "Enter contest code (6-8 characters)",
      findContest: "Find Contest",
      contestFound: "Contest Found",
      contestTitle: "Contest Title",
      contestDescription: "Description",
      startTime: "Start Time",
      endTime: "End Time",
      maxParticipants: "Max Participants",
      currentParticipants: "Registered",
      status: "Status",
      register: "Register",
      registering: "Registering...",
      back: "Back",
      success: "Registration Successful!",
      successMessage: "You have successfully registered for the contest. Please wait for admin approval.",
      goToContest: "Go to Contest",
      loginRequired: "Please login to join contest",
      invalidCode: "Invalid contest code",
      contestNotFound: "Contest not found with this code",
      registrationFailed: "Registration failed",
      alreadyRegistered: "You are already registered for this contest",
    },
  };

  const t = translations[currentLanguage] || translations.en;

  const handleFindContest = async () => {
    if (!contestCode.trim()) {
      showToast(t.invalidCode, "error");
      return;
    }

    setLoading(true);
    try {
      const contestData = await getContestByCode(contestCode.trim().toUpperCase());
      setContest(contestData);
      setStep("preview");
    } catch (error) {
      console.error("Error finding contest:", error);
      if (error.response?.status === 404) {
        showToast(t.contestNotFound, "error");
      } else {
        showToast(error.response?.data?.message || t.contestNotFound, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      showToast(t.loginRequired, "warning");
      return;
    }

    setLoading(true);
    try {
      const registration = await registerByContestCode(contestCode.trim().toUpperCase(), token);
      setStep("success");
      showToast(t.success, "success");
      if (onSuccess) {
        onSuccess(contest, registration);
      }
    } catch (error) {
      console.error("Error registering for contest:", error);
      if (error.response?.status === 409) {
        showToast(t.alreadyRegistered, "warning");
      } else {
        showToast(error.response?.data?.message || t.registrationFailed, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString(currentLanguage === "vi" ? "vi-VN" : "en-US");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "UPCOMING": return "text-blue-400";
      case "ONGOING": return "text-green-400";
      case "COMPLETED": return "text-gray-400";
      case "DRAFT": return "text-yellow-400";
      case "CANCELLED": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  if (step === "success") {
    return (
      <div className="max-w-md mx-auto bg-zinc-800 rounded-lg p-6 border border-zinc-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t.success}</h3>
          <p className="text-gray-300 mb-6">{t.successMessage}</p>
          <button
            onClick={() => window.location.href = `/contests/${contest.id}`}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t.goToContest}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-zinc-800 rounded-lg p-6 border border-zinc-700">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
        <p className="text-gray-400">{t.subtitle}</p>
      </div>

      {step === "input" && (
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={contestCode}
              onChange={(e) => setContestCode(e.target.value.toUpperCase())}
              placeholder={t.codePlaceholder}
              className="w-full px-4 py-3 bg-zinc-700 border border-zinc-600 rounded-md text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono"
              maxLength={8}
              disabled={loading}
            />
          </div>
          <button
            onClick={handleFindContest}
            disabled={loading || !contestCode.trim()}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {t.findContest}...
              </div>
            ) : (
              t.findContest
            )}
          </button>
        </div>
      )}

      {step === "preview" && contest && (
        <div className="space-y-4">
          <div className="bg-zinc-700 rounded-lg p-4">
            <h3 className="text-lg font-bold text-white mb-3">{t.contestFound}</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">{t.contestTitle}</label>
                <p className="text-white font-medium">{contest.title}</p>
              </div>
              
              {contest.description && (
                <div>
                  <label className="text-sm text-gray-400">{t.contestDescription}</label>
                  <p className="text-gray-300 text-sm">{contest.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400">{t.startTime}</label>
                  <p className="text-white text-sm">{formatDateTime(contest.startTime)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">{t.endTime}</label>
                  <p className="text-white text-sm">{formatDateTime(contest.endTime)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400">{t.status}</label>
                  <p className={`text-sm font-medium ${getStatusColor(contest.status)}`}>
                    {contest.status}
                  </p>
                </div>
                {contest.maxParticipants && (
                  <div>
                    <label className="text-sm text-gray-400">{t.maxParticipants}</label>
                    <p className="text-white text-sm">
                      {contest.currentParticipants || 0} / {contest.maxParticipants}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setStep("input")}
              className="flex-1 px-4 py-2 bg-zinc-600 text-gray-300 rounded-md hover:bg-zinc-500 transition-colors"
            >
              {t.back}
            </button>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t.registering : t.register}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestCodeRegistration;
