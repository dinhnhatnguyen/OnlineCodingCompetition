import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../../contexts/ToastContext";
import {
  getAllReports,
  getReportsByStatus,
  reviewReport,
  getReportStatuses,
} from "../../api/reportsApi";

const ReportsManagement = () => {
  const { currentLanguage } = useLanguage();
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: "",
    adminResponse: "",
  });
  const [reportStatuses, setReportStatuses] = useState({});

  const translations = {
    vi: {
      title: "Quản lý báo cáo bài toán",
      filterByStatus: "Lọc theo trạng thái",
      allReports: "Tất cả báo cáo",
      noReports: "Không có báo cáo nào",
      loadMore: "Tải thêm",
      review: "Xem xét",
      reviewReport: "Xem xét báo cáo",
      reportDetails: "Chi tiết báo cáo",
      reportType: "Loại báo cáo",
      reportedBy: "Báo cáo bởi",
      reportedAt: "Thời gian báo cáo",
      status: "Trạng thái",
      adminResponse: "Phản hồi admin",
      adminResponsePlaceholder: "Nhập phản hồi của admin...",
      save: "Lưu",
      cancel: "Hủy",
      close: "Đóng",
      problem: "Bài toán",
      description: "Mô tả",
      reviewSuccess: "Đã cập nhật báo cáo thành công",
      statistics: "Thống kê",
      total: "Tổng số",
      pending: "Chờ xử lý",
      resolved: "Đã giải quyết",
    },
    en: {
      title: "Problem Reports Management",
      filterByStatus: "Filter by status",
      allReports: "All reports",
      noReports: "No reports found",
      loadMore: "Load more",
      review: "Review",
      reviewReport: "Review Report",
      reportDetails: "Report Details",
      reportType: "Report Type",
      reportedBy: "Reported by",
      reportedAt: "Reported at",
      status: "Status",
      adminResponse: "Admin Response",
      adminResponsePlaceholder: "Enter admin response...",
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      problem: "Problem",
      description: "Description",
      reviewSuccess: "Report updated successfully",
      statistics: "Statistics",
      total: "Total",
      pending: "Pending",
      resolved: "Resolved",
    },
  };

  const t = translations[currentLanguage] || translations.vi;

  useEffect(() => {
    loadReportStatuses();
    loadReports();
  }, [selectedStatus]);

  const loadReportStatuses = async () => {
    try {
      const statuses = await getReportStatuses();
      setReportStatuses(statuses);
    } catch (error) {
      console.error("Error loading report statuses:", error);
    }
  };

  const loadReports = async (page = 0) => {
    setLoading(true);
    try {
      let response;
      if (selectedStatus === "ALL") {
        response = await getAllReports(page, 10);
      } else {
        response = await getReportsByStatus(selectedStatus, page, 10);
      }

      if (page === 0) {
        setReports(response.content);
      } else {
        setReports((prev) => [...prev, ...response.content]);
      }
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (currentPage + 1 < totalPages) {
      loadReports(currentPage + 1);
    }
  };

  const handleReview = (report) => {
    setSelectedReport(report);
    setReviewData({
      status: report.status,
      adminResponse: report.adminResponse || "",
    });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    try {
      await reviewReport(selectedReport.id, reviewData);
      showToast(t.reviewSuccess, "success");
      setShowReviewModal(false);
      loadReports(); // Reload reports
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const formatTime = (dateString) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: currentLanguage === "vi" ? vi : undefined,
    });
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      IN_REVIEW: "bg-blue-100 text-blue-800 border-blue-200",
      RESOLVED: "bg-green-100 text-green-800 border-green-200",
      REJECTED: "bg-red-100 text-red-800 border-red-200",
      CLOSED: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${
          statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"
        }`}
      >
        {reportStatuses[status] || status}
      </span>
    );
  };

  const getReportTypeColor = (type) => {
    const colors = {
      INCORRECT_TEST_CASE: "text-red-600",
      UNCLEAR_PROBLEM_STATEMENT: "text-orange-600",
      WRONG_EXPECTED_OUTPUT: "text-purple-600",
      MISSING_CONSTRAINTS: "text-blue-600",
      TYPO_OR_GRAMMAR: "text-green-600",
      OTHER: "text-gray-600",
    };
    return colors[type] || "text-gray-600";
  };

  // Statistics calculation
  const stats = {
    total: totalElements,
    pending: reports.filter((r) => r.status === "PENDING").length,
    resolved: reports.filter((r) => r.status === "RESOLVED").length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-blue-600">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">{t.total}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600">{t.pending}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="text-2xl font-bold text-green-600">
              {stats.resolved}
            </div>
            <div className="text-sm text-gray-600">{t.resolved}</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.filterByStatus}
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">{t.allReports}</option>
            {Object.entries(reportStatuses).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-500">{t.noReports}</div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {report.title}
                    </h3>
                    {getStatusBadge(report.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {t.problem}:{" "}
                    <span className="font-medium">{report.problemTitle}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <span
                      className={`font-medium ${getReportTypeColor(
                        report.reportType
                      )}`}
                    >
                      {report.reportType}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {report.description.length > 150
                      ? `${report.description.substring(0, 150)}...`
                      : report.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>
                      {t.reportedBy}: {report.reportedByUsername}
                    </span>
                    <span>{formatTime(report.createdAt)}</span>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleReview(report)}
                    className="px-4 py-2 bg-blue-500 !text-white font-medium border border-blue-500 rounded-md text-sm hover:bg-blue-600 hover:border-blue-600 hover:!text-blue-100 hover:scale-105 shadow-sm transition-all duration-200"
                  >
                    {t.review}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {currentPage + 1 < totalPages && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white border border-blue-600 rounded-md hover:bg-blue-700 hover:border-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : t.loadMore}
          </button>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                {t.reviewReport}
              </h3>

              {/* Report Details */}
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2 text-gray-900">
                  {t.reportDetails}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="text-gray-700">
                    <strong className="text-gray-900">{t.problem}:</strong>{" "}
                    {selectedReport.problemTitle}
                  </div>
                  <div className="text-gray-700">
                    <strong className="text-gray-900">{t.reportType}:</strong>{" "}
                    {selectedReport.reportType}
                  </div>
                  <div className="text-gray-700">
                    <strong className="text-gray-900">{t.reportedBy}:</strong>{" "}
                    {selectedReport.reportedByUsername}
                  </div>
                  <div className="text-gray-700">
                    <strong className="text-gray-900">{t.reportedAt}:</strong>{" "}
                    {formatTime(selectedReport.createdAt)}
                  </div>
                  <div className="text-gray-700">
                    <strong className="text-gray-900">{t.description}:</strong>
                  </div>
                  <div className="pl-4 text-gray-600">
                    {selectedReport.description}
                  </div>
                </div>
              </div>

              {/* Review Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.status}
                  </label>
                  <select
                    value={reviewData.status}
                    onChange={(e) =>
                      setReviewData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.entries(reportStatuses).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.adminResponse}
                  </label>
                  <textarea
                    value={reviewData.adminResponse}
                    onChange={(e) =>
                      setReviewData((prev) => ({
                        ...prev,
                        adminResponse: e.target.value,
                      }))
                    }
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={t.adminResponsePlaceholder}
                  />
                </div>
              </div>

              <div
                className="flex justify-end mt-6 pt-4 border-t border-gray-200"
                style={{ gap: "5px" }}
              >
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-300 hover:border-gray-400 transition-colors duration-200"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleSubmitReview}
                  className="px-6 py-2 bg-blue-600 !text-white font-medium border border-blue-600 rounded-md hover:bg-blue-700 hover:border-blue-700 hover:!text-white shadow-sm transition-all duration-200"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement;
