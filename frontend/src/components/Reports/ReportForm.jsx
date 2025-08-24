import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../../contexts/ToastContext";
import { createReport, getReportTypes } from "../../api/reportsApi";

const ReportForm = ({ problemId, problemTitle, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const { showToast } = useToast();
  const [reportTypes, setReportTypes] = useState({});
  const [formData, setFormData] = useState({
    problemId: problemId,
    reportType: "",
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations = {
    vi: {
      reportProblem: "Báo cáo lỗi bài toán",
      reportType: "Loại báo cáo",
      selectType: "Chọn loại báo cáo",
      title: "Tiêu đề",
      titlePlaceholder: "Nhập tiêu đề ngắn gọn cho báo cáo",
      description: "Mô tả chi tiết",
      descriptionPlaceholder: "Mô tả chi tiết về vấn đề bạn gặp phải...",
      submit: "Gửi báo cáo",
      cancel: "Hủy",
      loginRequired: "Bạn cần đăng nhập để báo cáo lỗi",
      reportSuccess: "Báo cáo đã được gửi thành công",
      fillAllFields: "Vui lòng điền đầy đủ thông tin",
      problemLabel: "Bài toán:",
    },
    en: {
      reportProblem: "Report Problem Issue",
      reportType: "Report Type",
      selectType: "Select report type",
      title: "Title",
      titlePlaceholder: "Enter a brief title for your report",
      description: "Detailed Description",
      descriptionPlaceholder: "Describe the issue you encountered in detail...",
      submit: "Submit Report",
      cancel: "Cancel",
      loginRequired: "You need to login to report issues",
      reportSuccess: "Report submitted successfully",
      fillAllFields: "Please fill in all required fields",
      problemLabel: "Problem:",
    },
  };

  const t = translations[currentLanguage] || translations.vi;

  useEffect(() => {
    loadReportTypes();
  }, []);

  const loadReportTypes = async () => {
    try {
      const types = await getReportTypes();
      setReportTypes(types);
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reportType || !formData.title || !formData.description) {
      showToast(t.fillAllFields, "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const report = await createReport(formData);
      showToast(t.reportSuccess, "success");
      if (onSuccess) {
        onSuccess(report);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <h3 className="text-lg font-semibold mb-4 text-white">
          {t.reportProblem}
        </h3>
        <p className="text-gray-400 mb-4">{t.loginRequired}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-zinc-700 text-gray-300 rounded-md hover:bg-zinc-600 transition-colors duration-200"
        >
          {t.cancel}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-semibold mb-4 text-white">
        {t.reportProblem}
      </h3>

      {problemTitle && (
        <div className="mb-4 p-3 bg-zinc-800 border border-zinc-700 rounded-md">
          <p className="text-sm text-gray-300">
            {t.problemLabel}{" "}
            <span className="font-medium text-white">{problemTitle}</span>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t.reportType} *
          </label>
          <select
            name="reportType"
            value={formData.reportType}
            onChange={handleInputChange}
            className="w-full p-2 bg-zinc-800 border border-zinc-600 text-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-zinc-700"
            required
            disabled={isSubmitting}
          >
            <option value="">{t.selectType}</option>
            {Object.entries(reportTypes).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t.title} *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder={t.titlePlaceholder}
            className="w-full p-2 bg-zinc-800 border border-zinc-600 text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-zinc-700"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            {t.description} *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder={t.descriptionPlaceholder}
            rows="4"
            className="w-full p-2 bg-zinc-800 border border-zinc-600 text-white placeholder-gray-400 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-zinc-700 resize-none"
            required
            disabled={isSubmitting}
          />
        </div>

        {/* Buttons */}
        <div className="flex space-x-6 pt-4" style={{ gap: "10px" }}>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 !text-white font-medium rounded-md hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? currentLanguage === "vi"
                ? "Đang gửi..."
                : "Submitting..."
              : t.submit}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-700 !text-gray-300 font-medium rounded-md hover:bg-zinc-600 disabled:opacity-50 shadow-sm transition-all duration-200"
            disabled={isSubmitting}
          >
            {t.cancel}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
