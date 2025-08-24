import firebaseDataService from "./firebaseDataService";

/**
 * Offline-First Data Collector
 * Thu thập dữ liệu offline-first để tiết kiệm chi phí
 *
 * Hoạt động:
 * 1. Thu thập và lưu dữ liệu trong localStorage
 * 2. Chỉ upload khi người dùng thoát hoặc reload trang
 * 3. Tối ưu chi phí Firebase
 */
class OfflineDataCollector {
  constructor() {
    this.isInitialized = false;
    this.userId = null;
    this.userName = null;
    this.currentSession = null;
    this.sessionData = [];
    this.storageKey = "occs_offline_data";
    this.isUploading = false;

    // Bind methods để sử dụng trong event listeners
    this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
  }

  /**
   * Initialize collector
   * Khởi tạo collector
   */
  async initialize(userId, userName = null) {
    try {
      this.userId = parseInt(userId);
      this.userName = userName || `User_${userId}`;

      if (!this.userId || isNaN(this.userId)) {
        throw new Error(`Invalid userId: ${userId}`);
      }

      // Load existing offline data
      this.loadOfflineData();

      // Setup event listeners for upload triggers
      this.setupEventListeners();

      this.isInitialized = true;
      console.log("Data collector initialized for user:", this.userName);

      return true;
    } catch (error) {
      console.error("Failed to initialize data collector:", error);
      throw error;
    }
  }

  /**
   * Setup event listeners for upload triggers
   * Thiết lập event listeners để trigger upload
   */
  setupEventListeners() {
    // Upload when page is about to unload
    window.addEventListener("beforeunload", this.handleBeforeUnload);

    // Upload when page becomes hidden (user switches tab/minimizes)
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    // Upload every 5 minutes as backup
    this.backupInterval = setInterval(() => {
      this.uploadOfflineData();
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Handle before unload event
   * Xử lý sự kiện trước khi thoát trang
   */
  handleBeforeUnload() {
    this.uploadOfflineDataSync(); // Synchronous upload
  }

  /**
   * Handle visibility change event
   * Xử lý sự kiện thay đổi visibility
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.uploadOfflineData();
    }
  }

  /**
   * Start problem session
   * Bắt đầu session bài toán
   */
  startProblemSession(problemData) {
    if (!this.isInitialized) {
      console.warn("Collector not initialized");
      return null;
    }

    const sessionId = `session_${Date.now()}_${this.userId}`;
    const sessionStartTime = new Date();

    this.currentSession = {
      sessionId: sessionId,
      userId: this.userId,
      userName: this.userName,
      problemId: problemData.id,
      problemTitle: problemData.title,
      difficulty: problemData.difficulty,
      topics: problemData.topics || [],
      sessionStartTime: sessionStartTime,
      events: [],
      editCount: 0,
      submissionCount: 0,
      codingStartTime: null,
    };

    // Add session start event
    this.addEvent("session_started", {
      sessionStartTime: sessionStartTime.toISOString(),
      difficulty: problemData.difficulty,
      topics: problemData.topics || [],
    });

    console.log("Session started:", sessionId);
    return sessionId;
  }

  /**
   * Record code change
   * Ghi lại thay đổi code
   */
  recordCodeChange(newCode, language) {
    if (!this.currentSession) return;

    // Record first keystroke
    if (!this.currentSession.codingStartTime && newCode.trim()) {
      this.currentSession.codingStartTime = new Date();
      this.addEvent("coding_started", {
        language: language,
        firstKeystroke: this.currentSession.codingStartTime.toISOString(),
        timeFromSessionStart:
          this.currentSession.codingStartTime -
          this.currentSession.sessionStartTime,
      });
    }

    this.currentSession.editCount++;

    // Throttled recording (every 10 edits)
    if (this.currentSession.editCount % 10 === 0) {
      const codingDuration = this.currentSession.codingStartTime
        ? Math.floor((new Date() - this.currentSession.codingStartTime) / 1000)
        : 0;

      this.addEvent("code_changed", {
        language: language,
        editCount: this.currentSession.editCount,
        codingDuration: codingDuration,
        codeLength: newCode.length,
        lastEdit: new Date().toISOString(),
      });
    }

    // Save to localStorage
    this.saveOfflineData();
  }

  /**
   * Record submission attempt
   * Ghi lại lần thử submit
   */
  recordSubmissionAttempt(submissionData) {
    if (!this.currentSession) return;

    this.currentSession.submissionCount++;
    const solvingTime = this.currentSession.codingStartTime
      ? Math.floor((new Date() - this.currentSession.codingStartTime) / 1000)
      : 0;

    this.addEvent("submission_attempt", {
      language: submissionData.language,
      wasSuccessful: submissionData.wasSuccessful,
      result: submissionData.wasSuccessful ? "ACCEPTED" : "WRONG_ANSWER",
      solvingTime: solvingTime,
      attemptNumber: this.currentSession.submissionCount,
      additionalMetadata: submissionData.additionalMetadata || {},
    });

    this.saveOfflineData();
  }

  /**
   * End session
   * Kết thúc session
   */
  endSession() {
    if (!this.currentSession) return;

    const endTime = new Date();
    const totalViewTime = Math.floor(
      (endTime - this.currentSession.sessionStartTime) / 1000
    );
    const codingDuration = this.currentSession.codingStartTime
      ? Math.floor((endTime - this.currentSession.codingStartTime) / 1000)
      : 0;

    this.addEvent("session_ended", {
      sessionEndTime: endTime.toISOString(),
      totalViewTime: totalViewTime,
      codingDuration: codingDuration,
      editCount: this.currentSession.editCount,
      submissionCount: this.currentSession.submissionCount,
      solved: this.currentSession.submissionCount > 0,
    });

    console.log("Session ended");

    // Save final session data
    this.sessionData.push(this.currentSession);
    this.currentSession = null;
    this.saveOfflineData();

    // Upload immediately when session ends
    this.uploadOfflineData();
  }

  /**
   * Add event to current session (simplified format)
   * Thêm event vào session hiện tại (định dạng đơn giản)
   */
  addEvent(eventType, eventData) {
    if (!this.currentSession) return;

    // Simplified event structure
    const simplifiedEvent = {
      eventType: eventType,
      timestamp: new Date().toISOString(),
      eventData: this.simplifyEventData(eventData),
    };

    this.currentSession.events.push(simplifiedEvent);
  }

  /**
   * Simplify event data to reduce size
   * Đơn giản hóa dữ liệu event để giảm kích thước
   */
  simplifyEventData(eventData) {
    if (!eventData) return {};

    const simplified = {};

    // Only keep essential fields with shorter names
    if (eventData.editCount !== undefined)
      simplified.editCount = eventData.editCount;
    if (eventData.codeLength !== undefined)
      simplified.codeLength = eventData.codeLength;
    if (eventData.language !== undefined)
      simplified.language = eventData.language;
    if (eventData.wasSuccessful !== undefined)
      simplified.wasSuccessful = eventData.wasSuccessful;
    if (eventData.totalViewTime !== undefined)
      simplified.totalViewTime = eventData.totalViewTime;
    if (eventData.codingDuration !== undefined)
      simplified.codingDuration = eventData.codingDuration;
    if (eventData.solvingTime !== undefined)
      simplified.solvingTime = eventData.solvingTime;
    if (eventData.attemptNumber !== undefined)
      simplified.attemptNumber = eventData.attemptNumber;
    if (eventData.result !== undefined) simplified.result = eventData.result;

    return simplified;
  }

  /**
   * Save data to localStorage
   * Lưu dữ liệu vào localStorage
   */
  saveOfflineData() {
    try {
      const data = {
        userId: this.userId,
        userName: this.userName,
        currentSession: this.currentSession,
        sessionData: this.sessionData,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("❌ Error saving offline data:", error);
    }
  }

  /**
   * Load data from localStorage
   * Tải dữ liệu từ localStorage
   */
  loadOfflineData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);

        // Only load data for the same user
        if (parsed.userId === this.userId) {
          this.sessionData = parsed.sessionData || [];
        }
      }
    } catch (error) {
      console.error("Error loading offline data:", error);
      this.sessionData = [];
    }
  }

  /**
   * Upload offline data to Firebase (async)
   * Upload dữ liệu offline lên Firebase (bất đồng bộ)
   */
  async uploadOfflineData() {
    if (this.isUploading || this.sessionData.length === 0) {
      return;
    }

    this.isUploading = true;
    console.log(`Uploading ${this.sessionData.length} sessions`);

    try {
      for (const session of this.sessionData) {
        await this.uploadSession(session);
      }

      // Clear uploaded data
      this.sessionData = [];
      this.saveOfflineData();

      console.log("Upload completed");
    } catch (error) {
      console.error("Error uploading data:", error);
    } finally {
      this.isUploading = false;
    }
  }

  /**
   * Upload offline data synchronously (for beforeunload)
   * Upload dữ liệu offline đồng bộ (cho beforeunload)
   */
  uploadOfflineDataSync() {
    if (this.sessionData.length === 0) return;

    // Use sendBeacon for reliable data sending during page unload
    const data = {
      userId: this.userId,
      userName: this.userName,
      sessions: this.sessionData,
    };

    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });

    // Try sendBeacon first (most reliable)
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/offline-data", blob);
      return;
    }

    // Fallback: try synchronous fetch
    try {
      fetch("/api/offline-data", {
        method: "POST",
        body: blob,
        keepalive: true,
      });
    } catch (error) {
      console.error("Failed to send data synchronously:", error);
    }
  }

  /**
   * Upload single session
   * Upload một session
   */
  async uploadSession(session) {
    try {
      // Calculate final summary
      const endTime = new Date();
      const totalViewTime = Math.floor(
        (endTime - new Date(session.sessionStartTime)) / 1000
      );
      const codingDuration = session.codingStartTime
        ? Math.floor((endTime - new Date(session.codingStartTime)) / 1000)
        : 0;

      const finalSummary = {
        totalViewTime: totalViewTime,
        codingDuration: codingDuration,
        editCount: session.editCount,
        submissionCount: session.submissionCount,
        solved: session.submissionCount > 0, // Simple check based on submissions
      };

      // Create session document in Firebase
      await firebaseDataService.createSession({
        sessionId: session.sessionId,
        userId: session.userId,
        userName: session.userName,
        problemId: session.problemId,
        problemTitle: session.problemTitle,
        difficulty: session.difficulty,
        topics: session.topics,
      });

      // Add all events to the session
      if (session.events.length > 0) {
        await firebaseDataService.addEventsToSession(
          session.sessionId,
          session.events
        );
      }

      // Update session summary and end time
      await firebaseDataService.updateSessionSummary(
        session.sessionId,
        finalSummary,
        endTime.toISOString()
      );
    } catch (error) {
      console.error(`Error uploading session ${session.sessionId}:`, error);
      throw error;
    }
  }

  /**
   * Get current status
   * Lấy trạng thái hiện tại
   */
  getCurrentStatus() {
    return {
      isInitialized: this.isInitialized,
      userId: this.userId,
      userName: this.userName,
      hasActiveSession: !!this.currentSession,
      sessionId: this.currentSession?.sessionId,
      editCount: this.currentSession?.editCount || 0,
      submissionCount: this.currentSession?.submissionCount || 0,
      offlineSessionsCount: this.sessionData.length,
      isUploading: this.isUploading,
    };
  }

  /**
   * Get simplified events for debugging
   * Lấy events đơn giản để debug
   */
  getSimplifiedEvents() {
    if (!this.currentSession) {
      console.log("No active session");
      return [];
    }

    console.log("📊 Simplified Events Structure:");
    console.log("events: [");

    this.currentSession.events.forEach((event, index) => {
      console.log("  {");
      console.log(`    eventType: "${event.eventType}",`);
      console.log(`    timestamp: "${event.timestamp}",`);
      console.log(
        "    eventData: {",
        JSON.stringify(event.eventData).slice(1, -1),
        "}"
      );
      console.log(
        "  }" + (index < this.currentSession.events.length - 1 ? "," : "")
      );
    });

    console.log("]");

    return this.currentSession.events;
  }

  /**
   * Test Firebase connection
   * Kiểm tra kết nối Firebase
   */
  async testFirebaseConnection(testData) {
    try {
      const testSessionId = await firebaseDataService.testFirebaseConnection({
        userId: this.userId,
        userName: this.userName,
        ...testData,
      });

      console.log("Firebase connection test successful");
      return testSessionId;
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      throw error;
    }
  }

  /**
   * Cleanup
   * Dọn dẹp
   */
  cleanup() {
    // Remove event listeners
    window.removeEventListener("beforeunload", this.handleBeforeUnload);
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );

    // Clear backup interval
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    // Upload any remaining data
    this.uploadOfflineData();
  }
}

// Create singleton instance
const offlineDataCollector = new OfflineDataCollector();

export default offlineDataCollector;
