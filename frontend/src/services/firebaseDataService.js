import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../config/firebase";
import firebaseLogger from "../utils/firebaseLogger";

/**
 * Firebase Data Service - Session-Based Storage
 * Dịch vụ dữ liệu Firebase - Lưu trữ theo session để tránh phân mảnh
 */
class FirebaseDataService {
  constructor() {
    // Collection để lưu session documents
    this.COLLECTION_NAME = "userSessions";
  }

  /**
   * Create a new session document
   * Tạo document session mới
   */
  async createSession(sessionData) {
    try {
      const sessionDoc = {
        sessionId: sessionData.sessionId,
        userId: sessionData.userId,
        userName: sessionData.userName,
        problemId: sessionData.problemId,
        problemTitle: sessionData.problemTitle,
        difficulty: sessionData.difficulty,
        topics: sessionData.topics || [],
        sessionStartTime: serverTimestamp(),
        sessionEndTime: null,
        events: [],
        summary: {
          totalViewTime: 0,
          codingDuration: 0,
          editCount: 0,
          submissionCount: 0,
          solved: false,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(
        doc(db, this.COLLECTION_NAME, sessionData.sessionId),
        sessionDoc
      );

      console.log("Session created:", sessionData.sessionId);
      firebaseLogger.firebaseWrite(
        this.COLLECTION_NAME,
        "CREATE",
        sessionData.sessionId,
        true
      );

      return sessionData.sessionId;
    } catch (error) {
      console.error("Failed to create session:", error);
      firebaseLogger.firebaseWrite(
        this.COLLECTION_NAME,
        "CREATE",
        sessionData.sessionId,
        false,
        error
      );
      throw error;
    }
  }

  /**
   * Add events to session
   * Thêm events vào session
   */
  async addEventsToSession(sessionId, events) {
    try {
      const sessionRef = doc(db, this.COLLECTION_NAME, sessionId);

      await updateDoc(sessionRef, {
        events: arrayUnion(...events),
        updatedAt: serverTimestamp(),
      });

      console.log(`Added ${events.length} events to session`);
      firebaseLogger.firebaseWrite(
        this.COLLECTION_NAME,
        "UPDATE",
        sessionId,
        true
      );

      return true;
    } catch (error) {
      console.error("Failed to add events to session:", error);
      firebaseLogger.firebaseWrite(
        this.COLLECTION_NAME,
        "UPDATE",
        sessionId,
        false,
        error
      );
      throw error;
    }
  }

  /**
   * Update session summary and end time
   * Cập nhật tóm tắt session và thời gian kết thúc
   */
  async updateSessionSummary(sessionId, summary, endTime = null) {
    try {
      const sessionRef = doc(db, this.COLLECTION_NAME, sessionId);
      const updateData = {
        summary: summary,
        updatedAt: serverTimestamp(),
      };

      if (endTime) {
        updateData.sessionEndTime = endTime;
      }

      await updateDoc(sessionRef, updateData);

      console.log("Session completed:", sessionId);
      firebaseLogger.firebaseWrite(
        this.COLLECTION_NAME,
        "UPDATE",
        sessionId,
        true
      );

      return true;
    } catch (error) {
      console.error("Failed to update session summary:", error);
      firebaseLogger.firebaseWrite(
        this.COLLECTION_NAME,
        "UPDATE",
        sessionId,
        false,
        error
      );
      throw error;
    }
  }

  /**
   * Get user sessions
   * Lấy các session của người dùng
   */
  async getUserSessions(userId, limitCount = 100) {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const sessions = [];

      querySnapshot.forEach((doc) => {
        sessions.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return sessions;
    } catch (error) {
      console.error("Error getting user sessions:", error);
      throw error;
    }
  }

  /**
   * Get session by ID
   * Lấy session theo ID
   */
  async getSession(sessionId) {
    try {
      const sessionRef = doc(db, this.COLLECTION_NAME, sessionId);
      const sessionDoc = await getDoc(sessionRef);

      if (sessionDoc.exists()) {
        return {
          id: sessionDoc.id,
          ...sessionDoc.data(),
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error getting session:", error);
      throw error;
    }
  }

  /**
   * Test Firebase connection
   * Kiểm tra kết nối Firebase
   */
  async testFirebaseConnection(testData) {
    try {
      const testSessionId = `test_${Date.now()}`;
      const testSession = {
        sessionId: testSessionId,
        userId: testData.userId || 999,
        userName: testData.userName || "Test User",
        problemId: 999,
        problemTitle: "Connection Test",
        difficulty: "test",
        topics: ["test"],
        sessionStartTime: serverTimestamp(),
        sessionEndTime: serverTimestamp(),
        events: [
          {
            eventType: "connection_test",
            timestamp: new Date().toISOString(),
            eventData: testData,
          },
        ],
        summary: {
          totalViewTime: 0,
          codingDuration: 0,
          editCount: 0,
          submissionCount: 0,
          solved: false,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, this.COLLECTION_NAME, testSessionId), testSession);

      console.log("Firebase connection test successful");
      return testSessionId;
    } catch (error) {
      console.error("Firebase connection test failed:", error);
      throw error;
    }
  }
}

// Create singleton instance
const firebaseDataService = new FirebaseDataService();

export default firebaseDataService;
