// Cấu hình ngôn ngữ tiếng Việt cho ứng dụng OCCS
export const vi = {
  // Navigation
  nav: {
    home: "Trang chủ",
    problems: "Bài tập",
    contests: "Cuộc thi",
    scratchpad: "Bảng nháp",
    admin: "Quản trị",
    login: "Đăng nhập",
    logout: "Đăng xuất",
    profile: "Hồ sơ",
    settings: "Cài đặt",
  },

  // Authentication
  auth: {
    login: "Đăng nhập",
    register: "Đăng ký",
    username: "Tên đăng nhập",
    email: "Email",
    password: "Mật khẩu",
    confirmPassword: "Xác nhận mật khẩu",
    forgotPassword: "Quên mật khẩu?",
    alreadyHaveAccount: "Đã có tài khoản?",
    dontHaveAccount: "Chưa có tài khoản?",
    signInSuccess: "Đăng nhập thành công!",
    signUpSuccess: "Đăng ký thành công! Đang chuyển hướng...",
    passwordMismatch: "Mật khẩu không khớp",
    loading: "Đang xử lý...",
  },

  // Problems
  problems: {
    title: "Bài tập",
    search: "Tìm kiếm...",
    difficulty: "Độ khó",
    allDifficulties: "Tất cả độ khó",
    easy: "Dễ",
    medium: "Trung bình",
    hard: "Khó",
    status: "Trạng thái",
    topics: "Chủ đề",
    successRate: "Tỷ lệ thành công",
    noProblemsFound: "Không tìm thấy bài tập nào phù hợp",
    showing: "Hiển thị",
    to: "đến",
    of: "trong tổng số",
    results: "kết quả",
  },

  // Contests
  contests: {
    title: "Cuộc thi",
    search: "Tìm kiếm cuộc thi...",
    allStatus: "Tất cả trạng thái",
    upcoming: "Sắp diễn ra",
    ongoing: "Đang diễn ra",
    completed: "Đã kết thúc",
    allVisibility: "Tất cả quyền truy cập",
    public: "Công khai",
    private: "Riêng tư",
    noContestsFound: "Không tìm thấy cuộc thi nào",
    noContestsMatch:
      "Không có cuộc thi nào phù hợp với tiêu chí tìm kiếm. Hãy thử từ khóa khác.",
    noContestsAvailable: "Hiện tại chưa có cuộc thi nào. Hãy quay lại sau!",
    failedToLoad: "Không thể tải danh sách cuộc thi",
  },

  // Admin Dashboard
  admin: {
    dashboard: "Bảng điều khiển",
    totalProblems: "Tổng số bài tập",
    totalContests: "Tổng số cuộc thi",
    role: "Vai trò",
    problemsCreatedByYou: "do bạn tạo",
    contestsCreatedByYou: "do bạn tạo",
    viewAll: "Xem tất cả",
    noProblemsFound: "Không tìm thấy bài tập nào",
    noContestsFound: "Không tìm thấy cuộc thi nào",
    manageProblem: "Quản lý bài tập",
    manageContests: "Quản lý cuộc thi",
    manageUsers: "Quản lý người dùng",
  },

  // ScratchPad
  scratchpad: {
    title: "Bảng nháp code",
    editor: "Trình soạn thảo",
    input: "Đầu vào",
    output: "Kết quả",
    run: "Chạy code",
    running: "Đang chạy code...",
    fileName: "Tên file",
    download: "Tải code",
    clear: "Xóa code",
    copy: "Sao chép",
    inputPlaceholder: "Nhập dữ liệu đầu vào tại đây...",
    outputPlaceholder: "Kết quả sẽ hiển thị tại đây",
    runtime: "Runtime",
    memory: "Memory",
    error: "Có lỗi xảy ra khi chạy code",
  },

  // Common
  common: {
    loading: "Đang tải...",
    save: "Lưu",
    cancel: "Hủy",
    delete: "Xóa",
    edit: "Chỉnh sửa",
    create: "Tạo mới",
    update: "Cập nhật",
    submit: "Gửi",
    back: "Quay lại",
    next: "Tiếp theo",
    previous: "Trước",
    close: "Đóng",
    confirm: "Xác nhận",
    success: "Thành công",
    error: "Lỗi",
    warning: "Cảnh báo",
    info: "Thông tin",
  },

  // Test Cases
  testCases: {
    title: "Test Cases",
    analytics: "Phân tích Test Cases",
    quickGenerator: "Tạo nhanh Test Cases",
    templates: "Mẫu có sẵn",
    bulkInput: "Nhập hàng loạt",
    csvImport: "Import CSV",
    noTestCases: "Chưa có test case nào",
    addTestCases: "Thêm test cases để xem phân tích và đề xuất",
    qualityScore: "Điểm chất lượng",
    totalTestCases: "Tổng số test cases",
    exampleCases: "Test cases mẫu",
    hiddenCases: "Test cases ẩn",
    complexityDistribution: "Phân bố độ phức tạp",
  },
};

// Export default language
export default vi;
