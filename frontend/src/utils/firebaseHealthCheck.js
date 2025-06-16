import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import simpleFirebaseDataCollector from "../services/simpleFirebaseDataCollector";

/**
 * Firebase Health Check Utilities
 * Các tiện ích kiểm tra sức khỏe Firebase
 */

/**
 * Check if Firebase is properly initialized
 * Kiểm tra Firebase đã được khởi tạo đúng chưa
 */
export const checkFirebaseInitialization = () => {
  const results = {
    initialized: false,
    database: false,
    config: null,
    errors: [],
  };

  try {
    // Check if db is initialized
    if (db) {
      results.initialized = true;
      results.database = true;
      results.config = {
        projectId: db.app.options.projectId,
        authDomain: db.app.options.authDomain,
      };
    } else {
      results.errors.push("Firebase database not initialized");
    }
  } catch (error) {
    results.errors.push(`Initialization check failed: ${error.message}`);
  }

  return results;
};

/**
 * Test basic Firestore operations
 * Test các thao tác cơ bản của Firestore
 */
export const testFirestoreOperations = async () => {
  const results = {
    read: false,
    write: false,
    errors: [],
    testDocId: null,
  };

  try {
    // Test read operation
    console.log("Testing Firestore read operation...");
    const testCollection = collection(db, "healthCheck");
    await getDocs(testCollection);
    results.read = true;
    console.log(" Firestore read operation successful");

    // Test write operation
    console.log("Testing Firestore write operation...");
    const testDoc = {
      message: "Health check test",
      timestamp: serverTimestamp(),
      testId: Date.now(),
      userAgent: navigator.userAgent,
    };

    const docRef = await addDoc(testCollection, testDoc);
    results.write = true;
    results.testDocId = docRef.id;
    console.log(` Firestore write operation successful. Doc ID: ${docRef.id}`);

    // Verify the write by reading back
    const readBack = await getDoc(doc(db, "healthCheck", docRef.id));
    if (!readBack.exists()) {
      results.errors.push("Write verification failed - document not found");
    } else {
      console.log(" Write verification successful");
    }
  } catch (error) {
    results.errors.push(`Firestore operation failed: ${error.message}`);
    console.error(" Firestore operation error:", error);

    // Analyze error type
    if (error.code === "permission-denied") {
      results.errors.push("Permission denied - check Firestore security rules");
    } else if (error.code === "unavailable") {
      results.errors.push("Service unavailable - check network connection");
    } else if (error.code === "not-found") {
      results.errors.push(
        "Firestore database not found - may not be initialized"
      );
    }
  }

  return results;
};

/**
 * Test enhanced data service
 * Test dịch vụ thu thập dữ liệu nâng cao
 */
export const testEnhancedDataService = async () => {
  const results = {
    sessionStart: false,
    dataRecording: false,
    sessionEnd: false,
    errors: [],
    sessionId: null,
  };

  try {
    // Test user ID extraction
    let userId = 999; // Default test user
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        userId = payload.userId || payload.sub || 999;
        console.log(`Using user ID: ${userId}`);
      } catch (e) {
        console.warn("Could not extract user ID from token, using default");
      }
    }

    // Test problem data
    const problemData = {
      id: 999,
      title: "Health Check Problem",
      difficulty: "easy",
      topics: ["Test", "HealthCheck"],
      testCases: [],
    };

    // Test 1: Start session
    console.log("Testing simple session start...");
    const sessionId = await simpleFirebaseDataCollector.startProblemSession(
      problemData
    );
    results.sessionStart = true;
    results.sessionId = sessionId;
    console.log(` Session started: ${sessionId}`);

    // Wait a bit for session to be created
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Test 2: Record data
    console.log("Testing data recording...");
    await simpleFirebaseDataCollector.recordCodeChange(
      'console.log("health check");',
      "javascript"
    );
    results.dataRecording = true;
    console.log(" Data recording successful");

    // Test 3: End session
    console.log("Testing session end...");
    await simpleFirebaseDataCollector.endSession();
    results.sessionEnd = true;
    console.log(" Session ended successfully");

    // Verify session data exists
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const sessionDoc = await getDoc(doc(db, "problemSessions", sessionId));
    if (sessionDoc.exists()) {
      console.log(" Session data verified in Firestore");
      results.sessionData = sessionDoc.data();
    } else {
      results.errors.push("Session data not found in Firestore after creation");
    }
  } catch (error) {
    results.errors.push(`Enhanced data service test failed: ${error.message}`);
    console.error(" Enhanced data service error:", error);
  }

  return results;
};

/**
 * Check authentication status
 * Kiểm tra trạng thái xác thực
 */
export const checkAuthenticationStatus = () => {
  const results = {
    hasToken: false,
    tokenValid: false,
    userId: null,
    tokenExpiry: null,
    errors: [],
  };

  try {
    const token = localStorage.getItem("token");

    if (!token) {
      results.errors.push("No authentication token found");
      return results;
    }

    results.hasToken = true;

    // Parse JWT token
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      results.userId = payload.userId || payload.sub;
      results.tokenExpiry = payload.exp;

      // Check if token is expired
      const now = Date.now() / 1000;
      if (payload.exp && payload.exp > now) {
        results.tokenValid = true;
      } else {
        results.errors.push("Authentication token has expired");
      }
    } catch (parseError) {
      results.errors.push("Invalid token format");
    }
  } catch (error) {
    results.errors.push(`Authentication check failed: ${error.message}`);
  }

  return results;
};

/**
 * Comprehensive health check
 * Kiểm tra sức khỏe toàn diện
 */
export const runComprehensiveHealthCheck = async () => {
  console.log("🏥 Starting comprehensive Firebase health check...");

  const results = {
    timestamp: new Date().toISOString(),
    initialization: null,
    authentication: null,
    firestore: null,
    dataService: null,
    overall: "unknown",
    recommendations: [],
  };

  try {
    // 1. Check initialization
    console.log("1️ Checking Firebase initialization...");
    results.initialization = checkFirebaseInitialization();

    // 2. Check authentication
    console.log("2️ Checking authentication...");
    results.authentication = checkAuthenticationStatus();

    // 3. Test Firestore operation
    console.log("3️ Testing Firestore operations...");
    results.firestore = await testFirestoreOperations();

    // 4. Test enhanced data service
    console.log("4️ Testing enhanced data service...");
    results.dataService = await testEnhancedDataService();

    // Determine overall health
    const hasErrors = [
      results.initialization.errors,
      results.authentication.errors,
      results.firestore.errors,
      results.dataService.errors,
    ].some((errors) => errors.length > 0);

    const allOperationsWork =
      results.initialization.initialized &&
      results.firestore.read &&
      results.firestore.write &&
      results.dataService.sessionStart &&
      results.dataService.dataRecording &&
      results.dataService.sessionEnd;

    if (!hasErrors && allOperationsWork) {
      results.overall = "healthy";
    } else if (results.initialization.initialized && results.firestore.read) {
      results.overall = "partial";
    } else {
      results.overall = "unhealthy";
    }

    // Generate recommendations
    if (!results.authentication.hasToken) {
      results.recommendations.push(
        "User needs to log in to enable data collection"
      );
    }
    if (!results.firestore.write) {
      results.recommendations.push(
        "Check Firestore security rules - write permission may be denied"
      );
    }
    if (results.firestore.errors.some((e) => e.includes("not-found"))) {
      results.recommendations.push(
        "Enable Firestore Database in Firebase Console"
      );
    }
    if (!results.dataService.sessionStart) {
      results.recommendations.push(
        "Enhanced data service may have configuration issues"
      );
    }

    console.log(` Health check completed. Overall status: ${results.overall}`);
    return results;
  } catch (error) {
    console.error(" Health check failed:", error);
    results.overall = "error";
    results.error = error.message;
    return results;
  }
};

export default {
  checkFirebaseInitialization,
  testFirestoreOperations,
  testEnhancedDataService,
  checkAuthenticationStatus,
  runComprehensiveHealthCheck,
};
