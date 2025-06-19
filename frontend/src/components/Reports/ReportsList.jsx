import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../../contexts/ToastContext";
import { getAllReports, getReportsByStatus, reviewReport } from "../../api/reportsApi";

const ReportsList = ({ isAdmin = false }) => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    status: "",
    adminResponse: "",
  });

  const translations = {
    vi: {
      allReports: "Tất cả báo cáo",
      pending: "Chờ xử lý",
      inReview: "Đang xem xét",
      resolved: "Đã giải quyết",
      rejected: "Từ chối",
      closed: "Đã đóng",
      filterByStatus: "Lọc theo trạng thái",
      reportType: "Loại báo cáo",
      reportedBy: "Người báo cáo",
      createdAt: "Ngày tạo",
      status: "Trạng thái",
      actions: "Thao tác",
      review: "Xem xét",
      viewDetails: "Xem chi tiết",
      loadMore: "Tải thêm",
      noReports: "Không có báo cáo nào",
      reviewReport: "Xem xét báo cáo",
      adminResponse: "Phản hồi của admin",
      save: "Lưu",
      cancel: "Hủy",
      reviewSuccess: "Xem xét báo cáo thành công",
    },
    en: {
      allReports: "All Reports",
      pending: "Pending",
      inReview: "In Review",
      resolved: "Resolved",
      rejected: "Rejected",
      closed: "Closed",
      filterByStatus: "Filter by Status",
      reportType: "Report Type",
      reportedBy: "Reported By",
      createdAt: "Created At",
      status: "Status",
      actions: "Actions",
      review: "Review",
      viewDetails: "View Details",
      loadMore: "Load More",
      noReports: "No reports found",
      reviewReport: "Review Report",
      adminResponse: "Admin Response",
      save: "Save",
      cancel: "Cancel",
      reviewSuccess: "Report reviewed successfully",
    },
  };

  const t = translations[language];

  const statusOptions = [
    { value: "ALL", label: t.allReports },
    { value: "PENDING", label: t.pending },
    { value: "IN_REVIEW", label: t.inReview },
    { value: "RESOLVED", label: t.resolved },
    { value: "REJECTED", label: t.rejected },
    { value: "CLOSED", label: t.closed },
  ];

  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    IN_REVIEW: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    CLOSED: "bg-gray-100 text-gray-800",
  };

  useEffect(() => {
    loadReports();
  }, [selectedStatus]);

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
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
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
      const updatedReport = await reviewReport(selectedReport.id, reviewData);
      setReports((prev) =>
        prev.map((report) =>
          report.id === updatedReport.id ? updatedReport : report
        )
      );
      setShowReviewModal(false);
      showToast(t.reviewSuccess, "success");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const formatTime = (dateString) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: language === "vi" ? vi : undefined,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Báo cáo lỗi bài toán</h2>
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">
              {t.filterByStatus}:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="p-6">
        {loading && reports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t.noReports}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColors[report.status]
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Bài toán: <span className="font-medium">{report.problemTitle}</span>
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {report.description.length > 100
                        ? `${report.description.substring(0, 100)}...`
                        : report.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Báo cáo bởi: {report.reportedByUsername}</span>
                      <span>{formatTime(report.createdAt)}</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleReview(report)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        {t.review}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Load More Button */}
            {currentPage < totalPages - 1 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => loadReports(currentPage + 1)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  disabled={loading}
                >
                  {t.loadMore}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">{t.reviewReport}</h3>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">{selectedReport?.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{selectedReport?.description}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.status}
                </label>
                <select
                  value={reviewData.status}
                  onChange={(e) =>
                    setReviewData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="PENDING">{t.pending}</option>
                  <option value="IN_REVIEW">{t.inReview}</option>
                  <option value="RESOLVED">{t.resolved}</option>
                  <option value="REJECTED">{t.rejected}</option>
                  <option value="CLOSED">{t.closed}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.adminResponse}
                </label>
                <textarea
                  value={reviewData.adminResponse}
                  onChange={(e) =>
                    setReviewData((prev) => ({ ...prev, adminResponse: e.target.value }))
                  }
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded-md resize-none"
                  placeholder="Nhập phản hồi của admin..."
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleSubmitReview}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {t.save}
              </button>
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsList;
