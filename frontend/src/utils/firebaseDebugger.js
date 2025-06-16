import firebaseDataService from '../services/firebaseDataService';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Firebase Debugger Utility
 * Tiện ích debug Firebase
 */
class FirebaseDebugger {
  /**
   * Check if data exists in Firebase
   * Kiểm tra dữ liệu có tồn tại trong Firebase không
   */
  async checkFirebaseData(userId) {
    console.log(' Checking Firebase data for user:', userId);
    
    try {
      // Check problem sessions
      const sessions = await this.getProblemSessions(userId);
      console.log(' Problem Sessions:', sessions.length, sessions);
      
      // Check analytics events
      const analytics = await this.getAnalyticsEvents(userId);
      console.log('Analytics Events:', analytics.length, analytics);
      
      // Check user profile
      const profile = await this.getUserProfile(userId);
      console.log(' User Profile:', profile);
      
      return {
        sessions,
        analytics,
        profile,
        summary: {
          totalSessions: sessions.length,
          totalAnalytics: analytics.length,
          hasProfile: !!profile
        }
      };
    } catch (error) {
      console.error(' Error checking Firebase data:', error);
      return null;
    }
  }

  /**
   * Get problem sessions for user
   * Lấy problem sessions của user
   */
  async getProblemSessions(userId) {
    try {
      const q = query(
        collection(db, 'problemSessions'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const querySnapshot = await getDocs(q);
      const sessions = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === parseInt(userId)) {
          sessions.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      return sessions;
    } catch (error) {
      console.error('Error getting problem sessions:', error);
      return [];
    }
  }

  /**
   * Get analytics events for user
   * Lấy analytics events của user
   */
  async getAnalyticsEvents(userId) {
    try {
      const q = query(
        collection(db, 'analytics'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      const analytics = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId === parseInt(userId)) {
          analytics.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      return analytics;
    } catch (error) {
      console.error('Error getting analytics events:', error);
      return [];
    }
  }

  /**
   * Get user profile
   * Lấy user profile
   */
  async getUserProfile(userId) {
    try {
      return await firebaseDataService.getUserProfile(userId);
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Test Firebase connection
   * Test kết nối Firebase
   */
  async testFirebaseConnection() {
    console.log('🔗 Testing Firebase connection...');
    
    try {
      // Try to write a test document
      await firebaseDataService.recordAnalyticsEvent({
        eventType: 'connection_test',
        userId: 999999,
        timestamp: new Date(),
        testData: 'Firebase connection test'
      });
      
      console.log(' Firebase connection successful');
      return true;
    } catch (error) {
      console.error(' Firebase connection failed:', error);
      return false;
    }
  }

  /**
   * Monitor real-time data changes
   * Theo dõi thay đổi dữ liệu real-time
   */
  monitorRealTimeData(userId) {
    console.log(' Starting real-time monitoring for user:', userId);
    
    return firebaseDataService.subscribeToUserSessions(userId, (sessions) => {
      console.log(' Real-time update - Sessions:', sessions.length);
      sessions.forEach((session, index) => {
        console.log(`  Session ${index + 1}:`, {
          id: session.id,
          problemId: session.problemId,
          status: session.status,
          createdAt: session.createdAt?.toDate?.() || session.createdAt
        });
      });
    });
  }

  /**
   * Force create test data
   * Buộc tạo dữ liệu test
   */
  async createTestData(userId) {
    console.log(' Creating test data for user:', userId);
    
    try {
      // Create test session
      const sessionId = await firebaseDataService.createProblemSession({
        userId: parseInt(userId),
        problemId: 999,
        sessionStartTime: new Date(),
        status: 'active',
        metadata: {
          difficulty: 'test',
          topics: ['testing'],
          title: 'Test Problem'
        }
      });
      
      // Add some coding activity
      await firebaseDataService.recordCodingActivity(sessionId, {
        firstKeystroke: new Date(),
        selectedLanguage: 'javascript',
        editCount: 5,
        codingDuration: 120
      });
      
      // Add submission attempt
      await firebaseDataService.recordSubmissionAttempt(sessionId, {
        language: 'javascript',
        wasSuccessful: true,
        result: 'ACCEPTED',
        timeTaken: 180
      });
      
      // End session
      await firebaseDataService.endProblemSession(sessionId, {
        sessionData: {
          endTime: new Date(),
          totalViewTime: 300
        }
      });
      
      // Record analytics event
      await firebaseDataService.recordAnalyticsEvent({
        eventType: 'test_event',
        userId: parseInt(userId),
        problemId: 999,
        timestamp: new Date()
      });
      
      console.log(' Test data created successfully');
      return sessionId;
    } catch (error) {
      console.error(' Error creating test data:', error);
      return null;
    }
  }

  /**
   * Clear test data
   * Xóa dữ liệu test
   */
  async clearTestData(userId) {
    console.log(' Clearing test data for user:', userId);
    // Note: This would require admin permissions to delete documents
    // For now, just log the action
    console.log(' Manual deletion required in Firebase Console');
  }
}

// Create singleton instance
const firebaseDebugger = new FirebaseDebugger();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.firebaseDebugger = firebaseDebugger;
}

export default firebaseDebugger;
