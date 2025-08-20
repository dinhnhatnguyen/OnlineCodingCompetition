import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContestCodeRegistration from "../components/contest/ContestCodeRegistration";
import { useLanguage } from "../contexts/LanguageContext";

const JoinContest = () => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();

  const translations = {
    vi: {
      pageTitle: "Tham Gia Cuộc Thi",
      pageSubtitle: "Nhập mã cuộc thi để tham gia cuộc thi riêng tư",
      backToContests: "← Quay lại danh sách cuộc thi",
    },
    en: {
      pageTitle: "Join Contest",
      pageSubtitle: "Enter contest code to join private contests",
      backToContests: "← Back to Contests",
    },
  };

  const t = translations[currentLanguage] || translations.en;

  const handleSuccess = (contest, registration) => {
    // Navigate to contest page after successful registration
    navigate(`/contests/${contest.id}`);
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back Navigation */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/contests")}
              className="flex items-center text-gray-400 hover:text-pink-400 transition-colors duration-200 group"
            >
              <span className="group-hover:translate-x-[-4px] transition-transform duration-200">
                {t.backToContests}
              </span>
            </button>
          </div>

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              {t.pageTitle}
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              {t.pageSubtitle}
            </p>
          </div>

          {/* Contest Code Registration Component */}
          <div className="max-w-2xl mx-auto">
            <ContestCodeRegistration onSuccess={handleSuccess} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JoinContest;
