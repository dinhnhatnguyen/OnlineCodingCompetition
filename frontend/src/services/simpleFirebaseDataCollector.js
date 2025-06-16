import firebaseDataService from "./firebaseDataService";
import firebaseLogger from "../utils/firebaseLogger";

/**
 * Simple Firebase Data Collector
 * Thu thập dữ liệu hành vi người dùng và lưu vào 1 collection duy nhất
 */
class SimpleFirebaseDataCollector {
  constructor() {
    this.isInitialized = false;
    this.userId = null;
    this.userName = null;
    this.currentSessionId = null;
    this.sessionStartTime = null;
    this.codingStartTime = null;
    this.editCount = 0;
    this.currentProblem = null;
    this.submissionCount = 0;
  }

  /**
   * Initialize the data collector
   * Khởi tạo bộ thu thập dữ liệu
   */
  async initialize(userId, userName = null) {
    try {
      console.log("🔧 Initializing Simple Firebase Data Collector:", {
        userId: userId,
        userName: userName,
      });

      this.userId = parseInt(userId);
      this.userName = userName || `User_${userId}`;

      if (!this.userId || isNaN(this.userId)) {
        console.error("❌ Invalid userId provided:", userId);
        throw new Error(`Invalid userId: ${userId}`);
      }

      this.isInitialized = true;
      console.log("Simple Firebase Data Collector initialized successfully");

      // Save initialization event
      await firebaseDataService.saveUserBehaviorData({
        userId: this.userId,
        userName: this.userName,
        eventType: "system_initialized",
        eventData: {
          initializationTime: new Date().toISOString(),
          collectorVersion: "1.0",
        },
      });

      return true;
    } catch (error) {
      console.error(
        "Failed to initialize Simple Firebase Data Collector:",
        error
      );
      throw error;
    }
  }

  /**
   * Start problem session
   * Bắt đầu session giải bài toán
   */
  async startProblemSession(problemData) {
    try {
      if (!this.isInitialized) {
        console.warn("Data collector not initialized");
        return null;
      }

      console.log("🚀 Starting problem session:", {
        userId: this.userId,
        userName: this.userName,
        problemId: problemData.id,
        title: problemData.title,
      });

      this.currentProblem = problemData;
      this.sessionStartTime = new Date();
      this.editCount = 0;
      this.submissionCount = 0;
      this.codingStartTime = null;

      // Generate unique session ID
      this.currentSessionId = `session_${Date.now()}_${this.userId}`;

      // Save session start event
      await firebaseDataService.saveUserBehaviorData({
        userId: this.userId,
        userName: this.userName,
        eventType: "session_started",
        problemId: problemData.id,
        problemTitle: problemData.title,
        eventData: {
          sessionId: this.currentSessionId,
          difficulty: problemData.difficulty,
          topics: problemData.topics || [],
          sessionStartTime: this.sessionStartTime.toISOString(),
        },
      });

      console.log(
        "Problem session started successfully:",
        this.currentSessionId
      );
      return this.currentSessionId;
    } catch (error) {
      console.error("Failed to start problem session:", error);
      throw error;
    }
  }

  /**
   * Record code change
   * Ghi lại thay đổi code
   */
  async recordCodeChange(newCode, language) {
    if (!this.currentSessionId) return;

    try {
      // Record first keystroke
      if (!this.codingStartTime && newCode.trim()) {
        this.codingStartTime = new Date();

        await firebaseDataService.saveUserBehaviorData({
          userId: this.userId,
          userName: this.userName,
          eventType: "coding_started",
          problemId: this.currentProblem.id,
          problemTitle: this.currentProblem.title,
          eventData: {
            sessionId: this.currentSessionId,
            language: language,
            firstKeystroke: this.codingStartTime.toISOString(),
            timeFromSessionStart: this.codingStartTime - this.sessionStartTime,
          },
        });

        console.log("First keystroke recorded");
      }

      this.editCount++;

      // Throttled update (every 10 edits or 30 seconds)
      if (
        this.editCount % 10 === 0 ||
        !this.lastUpdateTime ||
        Date.now() - this.lastUpdateTime > 30000
      ) {
        const codingDuration = this.codingStartTime
          ? Math.floor((new Date() - this.codingStartTime) / 1000)
          : 0;

        await firebaseDataService.saveUserBehaviorData({
          userId: this.userId,
          userName: this.userName,
          eventType: "code_changed",
          problemId: this.currentProblem.id,
          problemTitle: this.currentProblem.title,
          eventData: {
            sessionId: this.currentSessionId,
            language: language,
            editCount: this.editCount,
            codingDuration: codingDuration,
            codeLength: newCode.length,
            lastEdit: new Date().toISOString(),
          },
        });

        this.lastUpdateTime = Date.now();
        console.log("Code change recorded, editCount:", this.editCount);
      }
    } catch (error) {
      console.error("Error recording code change:", error);
    }
  }

  /**
   * Record submission attempt
   * Ghi lại lần thử submit
   */
  async recordSubmissionAttempt(submissionData) {
    if (!this.currentSessionId) return;

    try {
      this.submissionCount++;
      const solvingTime = this.codingStartTime
        ? Math.floor((new Date() - this.codingStartTime) / 1000)
        : 0;

      await firebaseDataService.saveUserBehaviorData({
        userId: this.userId,
        userName: this.userName,
        eventType: "submission_attempt",
        problemId: this.currentProblem.id,
        problemTitle: this.currentProblem.title,
        eventData: {
          sessionId: this.currentSessionId,
          language: submissionData.language,
          wasSuccessful: submissionData.wasSuccessful,
          result: submissionData.wasSuccessful ? "ACCEPTED" : "WRONG_ANSWER",
          solvingTime: solvingTime,
          attemptNumber: this.submissionCount,
          difficulty: this.currentProblem.difficulty,
          additionalMetadata: submissionData.additionalMetadata || {},
        },
      });

      console.log(
        "Submission attempt recorded:",
        submissionData.wasSuccessful ? "SUCCESS" : "FAILED"
      );
    } catch (error) {
      console.error("Error recording submission attempt:", error);
    }
  }

  /**
   * End session
   * Kết thúc session
   */
  async endSession() {
    if (!this.currentSessionId) return;

    try {
      const endTime = new Date();
      const totalViewTime = Math.floor(
        (endTime - this.sessionStartTime) / 1000
      );
      const codingDuration = this.codingStartTime
        ? Math.floor((endTime - this.codingStartTime) / 1000)
        : 0;

      await firebaseDataService.saveUserBehaviorData({
        userId: this.userId,
        userName: this.userName,
        eventType: "session_ended",
        problemId: this.currentProblem.id,
        problemTitle: this.currentProblem.title,
        eventData: {
          sessionId: this.currentSessionId,
          sessionEndTime: endTime.toISOString(),
          totalViewTime: totalViewTime,
          codingDuration: codingDuration,
          editCount: this.editCount,
          submissionCount: this.submissionCount,
          solved: this.submissionCount > 0, // Simple check
        },
      });

      console.log("Session ended successfully");

      // Reset session data
      this.currentSessionId = null;
      this.sessionStartTime = null;
      this.codingStartTime = null;
      this.editCount = 0;
      this.submissionCount = 0;
      this.currentProblem = null;
    } catch (error) {
      console.error("Error ending session:", error);
    }
  }

  /**
   * Force sync to Firebase
   * Buộc đồng bộ lên Firebase
   */
  async forceSyncToFirebase() {
    if (!this.currentSessionId) return;

    try {
      console.log("🔄 Force syncing to Firebase...");

      const now = new Date();
      const totalViewTime = Math.floor((now - this.sessionStartTime) / 1000);
      const codingDuration = this.codingStartTime
        ? Math.floor((now - this.codingStartTime) / 1000)
        : 0;

      await firebaseDataService.saveUserBehaviorData({
        userId: this.userId,
        userName: this.userName,
        eventType: "session_sync",
        problemId: this.currentProblem.id,
        problemTitle: this.currentProblem.title,
        eventData: {
          sessionId: this.currentSessionId,
          syncTime: now.toISOString(),
          totalViewTime: totalViewTime,
          codingDuration: codingDuration,
          editCount: this.editCount,
          submissionCount: this.submissionCount,
        },
      });

      console.log(" Force sync completed");
    } catch (error) {
      console.error(" Force sync failed:", error);
    }
  }

  /**
   * Test Firebase connection
   * Kiểm tra kết nối Firebase
   */
  async testFirebaseConnection(testData) {
    try {
      console.log(" Testing Firebase connection...");

      await firebaseDataService.saveUserBehaviorData({
        userId: this.userId,
        userName: this.userName,
        eventType: "connection_test",
        eventData: {
          ...testData,
          testTimestamp: new Date().toISOString(),
        },
      });

      console.log(" Firebase connection test successful");
      return true;
    } catch (error) {
      console.error(" Firebase connection test failed:", error);
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
      hasActiveSession: !!this.currentSessionId,
      sessionId: this.currentSessionId,
      editCount: this.editCount,
      submissionCount: this.submissionCount,
      codingStarted: !!this.codingStartTime,
      sessionDuration: this.sessionStartTime
        ? Math.floor((new Date() - this.sessionStartTime) / 1000)
        : 0,
    };
  }
}

// Create singleton instance
const simpleFirebaseDataCollector = new SimpleFirebaseDataCollector();

export default simpleFirebaseDataCollector;
