import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  onSnapshot,
  enableNetwork,
  disableNetwork,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";
import firebaseDataService from "../services/firebaseDataService";
import simpleFirebaseDataCollector from "../services/simpleFirebaseDataCollector";

/**
 * Firebase Debug Component
 * Component debug Firebase connection
 */
const FirebaseDebug = () => {
  const [status, setStatus] = useState("checking");
  const [logs, setLogs] = useState([]);
  const [testData, setTestData] = useState(null);
  const [authStatus, setAuthStatus] = useState("checking");
  const [networkStatus, setNetworkStatus] = useState("online");
  const [realtimeData, setRealtimeData] = useState([]);
  const [detailedResults, setDetailedResults] = useState({});

  useEffect(() => {
    checkFirebaseStatus();
    checkAuthStatus();
    setupRealtimeListener();
  }, []);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { message, type, timestamp }]);
    console.log(`[Firebase Debug] ${message}`);
  };

  // 1. CHECK AUTHENTICATION STATUS
  const checkAuthStatus = () => {
    addLog("🔐 Checking authentication status...");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthStatus("no-token");
        addLog("❌ No JWT token found in localStorage", "error");
        return;
      }

      // Parse JWT token
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.userId || payload.sub;
        const exp = payload.exp;
        const now = Date.now() / 1000;

        if (exp && exp < now) {
          setAuthStatus("expired");
          addLog("❌ JWT token has expired", "error");
        } else {
          setAuthStatus("valid");
          addLog(`✅ Valid JWT token found. User ID: ${userId}`, "success");
          setDetailedResults((prev) => ({ ...prev, userId, tokenExp: exp }));
        }
      } catch (parseError) {
        setAuthStatus("invalid");
        addLog("❌ Invalid JWT token format", "error");
      }
    } catch (error) {
      setAuthStatus("error");
      addLog(`❌ Auth check error: ${error.message}`, "error");
    }
  };

  // 2. CHECK FIREBASE CONNECTION WITH DETAILED DIAGNOSTICS
  const checkFirebaseConnection = async () => {
    addLog("🔍 Starting comprehensive Firebase connection test...");

    try {
      // Test 1: Basic Firestore access
      addLog("📡 Testing basic Firestore access...");
      const testCollection = collection(db, "connectionTest");
      await getDocs(testCollection);
      addLog("✅ Basic Firestore access successful", "success");

      // Test 2: Write permission test
      addLog("✍️ Testing write permissions...");
      const writeTestDoc = {
        message: "Connection test",
        timestamp: serverTimestamp(),
        testId: Date.now(),
        userAgent: navigator.userAgent,
      };

      const docRef = await addDoc(
        collection(db, "connectionTest"),
        writeTestDoc
      );
      addLog(
        `✅ Write permission test successful. Doc ID: ${docRef.id}`,
        "success"
      );

      // Test 3: Read back the document
      addLog("📖 Testing read-back verification...");
      const readDoc = await getDoc(doc(db, "connectionTest", docRef.id));
      if (readDoc.exists()) {
        addLog("✅ Read-back verification successful", "success");
        setDetailedResults((prev) => ({ ...prev, lastWriteDocId: docRef.id }));
      } else {
        addLog("❌ Read-back verification failed", "error");
      }

      // Test 4: Network connectivity
      addLog("🌐 Testing network connectivity...");
      await enableNetwork(db);
      addLog("✅ Network connectivity confirmed", "success");

      setStatus("connected");
      addLog("🎉 All Firebase connection tests passed!", "success");
    } catch (error) {
      setStatus("error");
      addLog(`❌ Firebase connection error: ${error.message}`, "error");
      addLog(`🔍 Error code: ${error.code || "unknown"}`, "error");

      // Detailed error analysis
      if (error.code === "permission-denied") {
        addLog(
          "🔒 This is a permission error. Check Firestore security rules.",
          "warning"
        );
      } else if (error.code === "unavailable") {
        addLog(
          "🌐 This is a network error. Check internet connection.",
          "warning"
        );
      } else if (error.code === "not-found") {
        addLog("🗄️ Firestore database may not be initialized.", "warning");
      }

      setDetailedResults((prev) => ({ ...prev, connectionError: error }));
    }
  };

  // 3. SETUP REAL-TIME LISTENER FOR MONITORING
  const setupRealtimeListener = () => {
    addLog("🔄 Setting up real-time data monitoring...");

    try {
      const collections = ["userSessions"];

      collections.forEach((collectionName) => {
        const unsubscribe = onSnapshot(
          collection(db, collectionName),
          (snapshot) => {
            const data = [];
            snapshot.forEach((doc) => {
              data.push({
                id: doc.id,
                collection: collectionName,
                data: doc.data(),
                timestamp: new Date().toISOString(),
              });
            });

            if (data.length > 0) {
              addLog(
                `📊 Real-time update: ${collectionName} has ${data.length} documents`,
                "info"
              );
              setRealtimeData((prev) => [...prev.slice(-20), ...data]); // Keep last 20 updates
            }
          },
          (error) => {
            addLog(
              `❌ Real-time listener error for ${collectionName}: ${error.message}`,
              "error"
            );
          }
        );
      });

      addLog("✅ Real-time listeners setup complete", "success");
    } catch (error) {
      addLog(`❌ Real-time listener setup error: ${error.message}`, "error");
    }
  };

  const checkFirebaseStatus = async () => {
    addLog("🔍 Checking Firebase connection...");

    try {
      // Test 1: Basic Firebase connection
      addLog("📡 Testing basic Firebase connection...");
      const testCollection = collection(db, "debugTest");
      await getDocs(testCollection);
      addLog("✅ Firebase connection successful", "success");

      // Test 2: Write permission
      addLog("✍️ Testing write permissions...");
      const testDoc = {
        message: "Debug test",
        timestamp: serverTimestamp(),
        testId: Date.now(),
      };

      const docRef = await addDoc(collection(db, "debugTest"), testDoc);
      addLog(`✅ Write test successful. Doc ID: ${docRef.id}`, "success");

      // Test 3: Simple collector service
      addLog("🔧 Testing simple data collector...");
      const sessionStatus = simpleFirebaseDataCollector.getCurrentStatus();
      addLog(`📊 Session status: ${JSON.stringify(sessionStatus)}`, "info");

      setStatus("connected");
      addLog("🎉 All tests passed!", "success");
    } catch (error) {
      addLog(`❌ Firebase error: ${error.message}`, "error");
      addLog(`🔍 Error code: ${error.code}`, "error");
      addLog(`📋 Full error: ${JSON.stringify(error)}`, "error");
      setStatus("error");
    }
  };

  // 4. COMPREHENSIVE DATA COLLECTION TEST
  const testDataCollection = async () => {
    addLog("🧪 Starting comprehensive data collection test...");

    try {
      // Get user ID from token
      const token = localStorage.getItem("token");
      let userId = 999; // Default test user ID

      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          userId = payload.userId || payload.sub || 999;
          addLog(`👤 Using real user ID: ${userId}`, "info");
        } catch (e) {
          addLog("⚠️ Using test user ID: 999", "warning");
        }
      } else {
        addLog("⚠️ No token found, using test user ID: 999", "warning");
      }

      const problemData = {
        id: 1,
        title: "Debug Test Problem",
        difficulty: "easy",
        topics: ["Array", "Debug", "Test"],
        testCases: [
          {
            inputData: '{"input": [1,2,3]}',
            expectedOutputData: '{"expectedOutput": 6}',
          },
        ],
      };

      // Test 1: Start Simple Session
      addLog("🚀 Test 1: Starting simple session...");
      const sessionId = await simpleFirebaseDataCollector.startProblemSession(
        problemData
      );
      addLog(`✅ Session started successfully: ${sessionId}`, "success");
      setDetailedResults((prev) => ({ ...prev, sessionId }));

      // Wait a bit to ensure session is created
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test 2: Record Code Changes
      addLog("📝 Test 2: Recording code changes...");
      await simpleFirebaseDataCollector.recordCodeChange(
        "// Starting to code...",
        "javascript"
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      await simpleFirebaseDataCollector.recordCodeChange(
        "function solve(arr) {",
        "javascript"
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      await simpleFirebaseDataCollector.recordCodeChange(
        "function solve(arr) {\n  return arr.reduce((a,b) => a+b, 0);\n}",
        "javascript"
      );
      addLog("✅ Code changes recorded successfully", "success");

      // Test 3: Record Submission Attempt (Failed)
      addLog("📤 Test 3: Recording failed submission...");
      await simpleFirebaseDataCollector.recordSubmissionAttempt({
        language: "javascript",
        wasSuccessful: false,
        additionalMetadata: {
          test: true,
          error: "Wrong Answer",
          attempt: 1,
        },
      });
      addLog("✅ Failed submission recorded successfully", "success");

      // Test 5: Record Submission Attempt (Success)
      addLog("📤 Test 5: Recording successful submission...");
      await firebaseEnhancedDataService.recordSubmissionAttempt({
        language: "javascript",
        wasSuccessful: true,
        additionalMetadata: JSON.stringify({
          test: true,
          runtime: "45ms",
          memory: "12MB",
          attempt: 2,
        }),
      });
      addLog("✅ Successful submission recorded successfully", "success");

      // Test 6: End Session
      addLog("🏁 Test 6: Ending session...");
      await firebaseEnhancedDataService.endEnhancedSession();
      addLog("✅ Session ended successfully", "success");

      // Test 7: Verify Data in Firestore
      addLog("🔍 Test 7: Verifying data in Firestore...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for data to sync

      const sessionDoc = await getDoc(doc(db, "problemSessions", sessionId));
      if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data();
        addLog("✅ Session data found in Firestore!", "success");
        addLog(
          `📊 Session details: ${JSON.stringify({
            userId: sessionData.userId,
            problemId: sessionData.problemId,
            solved: sessionData.performance?.solved,
            attempts: sessionData.submissionHistory?.length || 0,
          })}`,
          "info"
        );
        setDetailedResults((prev) => ({ ...prev, sessionData }));
      } else {
        addLog("❌ Session data NOT found in Firestore!", "error");
      }

      addLog("🎉 Comprehensive data collection test completed!", "success");
    } catch (error) {
      addLog(`❌ Data collection test error: ${error.message}`, "error");
      addLog(`🔍 Error code: ${error.code || "unknown"}`, "error");
      addLog(`📋 Stack trace: ${error.stack}`, "error");
      setDetailedResults((prev) => ({ ...prev, dataCollectionError: error }));
    }
  };

  const checkFirestoreCollections = async () => {
    addLog("📚 Checking Firestore collections...");

    try {
      const collections = ["userSessions", "debugTest"];

      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          addLog(
            `📁 Collection '${collectionName}': ${snapshot.size} documents`,
            "info"
          );

          if (snapshot.size > 0) {
            snapshot.forEach((doc) => {
              addLog(`  📄 Doc ID: ${doc.id}`, "info");
            });
          }
        } catch (error) {
          addLog(
            `❌ Error reading collection '${collectionName}': ${error.message}`,
            "error"
          );
        }
      }
    } catch (error) {
      addLog(`❌ Error checking collections: ${error.message}`, "error");
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      default:
        return "text-gray-300";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-zinc-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-6">
        🔥 Firebase Debug Console
      </h2>

      {/* Status */}
      <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          Connection Status
        </h3>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${
              status === "connected"
                ? "bg-green-400"
                : status === "error"
                ? "bg-red-400"
                : "bg-yellow-400"
            }`}
          ></div>
          <span className="text-gray-300">
            {status === "connected"
              ? "Connected"
              : status === "error"
              ? "Error"
              : "Checking..."}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Debug Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button
            onClick={checkFirebaseConnection}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            🔍 Check Connection
          </button>
          <button
            onClick={checkAuthStatus}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
          >
            🔐 Check Auth
          </button>
          <button
            onClick={testDataCollection}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
          >
            🧪 Test Data Collection
          </button>
          <button
            onClick={checkFirestoreCollections}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
          >
            📚 Check Collections
          </button>
        </div>
      </div>

      {/* Firebase Config Info */}
      <div className="mb-6 p-4 bg-zinc-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          Firebase Config
        </h3>
        <div className="text-sm text-gray-300 space-y-1">
          <div>Project ID: occs-92f83</div>
          <div>Database: {db ? "Initialized" : "Not initialized"}</div>
          <div>Environment: {process.env.NODE_ENV}</div>
        </div>
      </div>

      {/* Logs */}
      <div className="p-4 bg-zinc-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Debug Logs</h3>
        <div className="space-y-1 max-h-96 overflow-y-auto bg-black p-3 rounded font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-gray-500 text-xs min-w-[60px]">
                {log.timestamp}
              </span>
              <span className={getLogColor(log.type)}>{log.message}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              No logs yet. Click "Check Connection" to start debugging.
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-zinc-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          Debug Instructions
        </h3>
        <div className="text-sm text-gray-300 space-y-2">
          <div>1. Click "Check Connection" to verify Firebase setup</div>
          <div>
            2. Click "Test Data Collection" to manually test data saving
          </div>
          <div>3. Click "Check Collections" to see what data exists</div>
          <div>4. Check browser console for additional error details</div>
          <div>5. Verify Firestore Database is enabled in Firebase Console</div>
        </div>
      </div>

      {/* Common Issues */}
      <div className="mt-6 p-4 bg-red-900 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          ⚠️ Common Issues
        </h3>
        <div className="text-sm text-red-200 space-y-2">
          <div>
            <strong>Firestore not enabled:</strong> Go to Firebase Console →
            Firestore Database → Create database
          </div>
          <div>
            <strong>Permission denied:</strong> Update Firestore rules to allow
            read/write (for testing)
          </div>
          <div>
            <strong>Network error:</strong> Check internet connection and
            Firebase project status
          </div>
          <div>
            <strong>Authentication error:</strong> Make sure user is logged in
          </div>
        </div>
      </div>

      {/* Firestore Rules */}
      <div className="mt-6 p-4 bg-yellow-900 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          🔒 Firestore Rules (For Testing)
        </h3>
        <div className="text-sm text-yellow-200 mb-2">
          Copy this to Firebase Console → Firestore Database → Rules:
        </div>
        <pre className="bg-black p-3 rounded text-xs text-green-400 overflow-x-auto">
          {`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for testing (NOT for production)
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
        </pre>
      </div>
    </div>
  );
};

export default FirebaseDebug;
