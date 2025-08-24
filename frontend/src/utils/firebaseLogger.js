/**
 * Firebase Data Collection Logger
 * Logger cho việc thu thập dữ liệu Firebase
 */
class FirebaseLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.isEnabled = true;
    
    // Make logger available globally for debugging
    if (typeof window !== 'undefined') {
      window.firebaseLogger = this;
    }
  }

  /**
   * Log with timestamp and status
   * Log với timestamp và trạng thái
   */
  log(level, category, message, data = null) {
    if (!this.isEnabled) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      category: category.toUpperCase(),
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : null,
      id: Date.now() + Math.random()
    };

    this.logs.unshift(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console output with colors
    const emoji = this.getEmoji(level, category);
    const color = this.getColor(level);
    
    console.log(
      `%c${emoji} [${level.toUpperCase()}] ${category}: ${message}`,
      `color: ${color}; font-weight: bold;`,
      data || ''
    );

    // Store in localStorage for persistence
    this.saveToStorage();
  }

  /**
   * Get emoji for log type
   * Lấy emoji cho loại log
   */
  getEmoji(level, category) {
    const emojiMap = {
      'SESSION': '🎯',
      'CODING': '💻',
      'SUBMISSION': '📤',
      'SYNC': '🔄',
      'ERROR': '❌',
      'SUCCESS': '✅',
      'WARNING': '⚠️',
      'INFO': 'ℹ️',
      'DEBUG': '🔧'
    };
    
    return emojiMap[category] || emojiMap[level.toUpperCase()] || '📝';
  }

  /**
   * Get color for log level
   * Lấy màu cho level log
   */
  getColor(level) {
    const colorMap = {
      'ERROR': '#ff4444',
      'WARNING': '#ffaa00',
      'SUCCESS': '#00aa00',
      'INFO': '#0088ff',
      'DEBUG': '#888888'
    };
    
    return colorMap[level.toUpperCase()] || '#333333';
  }

  /**
   * Session logging methods
   * Phương thức log session
   */
  sessionStarted(sessionId, problemData) {
    this.log('success', 'session', `Session started: ${sessionId}`, {
      sessionId,
      problemId: problemData.id,
      problemTitle: problemData.title,
      difficulty: problemData.difficulty
    });
  }

  sessionEnded(sessionId, duration) {
    this.log('success', 'session', `Session ended: ${sessionId}`, {
      sessionId,
      duration: `${Math.round(duration / 1000)}s`
    });
  }

  /**
   * Coding activity logging
   * Log hoạt động coding
   */
  firstKeystroke(sessionId, language) {
    this.log('info', 'coding', `First keystroke recorded`, {
      sessionId,
      language,
      status: 'UPLOADED_TO_FIREBASE'
    });
  }

  codeChanged(sessionId, codeLength, language) {
    this.log('info', 'coding', `Code change recorded`, {
      sessionId,
      codeLength,
      language,
      status: 'UPLOADED_TO_FIREBASE'
    });
  }

  /**
   * Submission logging
   * Log submission
   */
  submissionAttempt(sessionId, submissionData, success) {
    this.log('info', 'submission', `Submission ${success ? 'successful' : 'failed'}`, {
      sessionId,
      language: submissionData.language,
      wasSuccessful: submissionData.wasSuccessful,
      status: success ? 'UPLOADED_TO_FIREBASE' : 'UPLOAD_FAILED'
    });
  }

  /**
   * Sync logging
   * Log đồng bộ
   */
  syncStarted(type = 'auto') {
    this.log('info', 'sync', `Sync started (${type})`, {
      syncType: type,
      timestamp: new Date().toISOString()
    });
  }

  syncCompleted(type = 'auto', itemCount = 0) {
    this.log('success', 'sync', `Sync completed (${type})`, {
      syncType: type,
      itemsSynced: itemCount,
      status: 'UPLOADED_TO_FIREBASE'
    });
  }

  syncFailed(type = 'auto', error) {
    this.log('error', 'sync', `Sync failed (${type})`, {
      syncType: type,
      error: error.message || error,
      status: 'UPLOAD_FAILED'
    });
  }

  /**
   * Firebase operation logging
   * Log các thao tác Firebase
   */
  firebaseWrite(collection, operation, docId, success, error = null) {
    const level = success ? 'success' : 'error';
    const message = `Firebase ${operation} ${success ? 'successful' : 'failed'}`;
    
    this.log(level, 'sync', message, {
      collection,
      operation,
      documentId: docId,
      status: success ? 'UPLOADED_TO_FIREBASE' : 'UPLOAD_FAILED',
      error: error?.message || error
    });
  }

  /**
   * Auto-save logging
   * Log auto-save
   */
  autoSaveTriggered(sessionId) {
    this.log('info', 'sync', 'Auto-save triggered', {
      sessionId,
      trigger: 'TIMER_30S'
    });
  }

  pageUnloadSave(sessionId) {
    this.log('warning', 'sync', 'Page unload save triggered', {
      sessionId,
      trigger: 'PAGE_UNLOAD'
    });
  }

  visibilityChangeSave(sessionId) {
    this.log('info', 'sync', 'Visibility change save triggered', {
      sessionId,
      trigger: 'VISIBILITY_CHANGE'
    });
  }

  /**
   * Error logging
   * Log lỗi
   */
  error(category, message, error, context = {}) {
    this.log('error', category, message, {
      error: error.message || error,
      stack: error.stack,
      context,
      status: 'ERROR'
    });
  }

  /**
   * Get upload status summary
   * Lấy tóm tắt trạng thái upload
   */
  getUploadStatus() {
    const recentLogs = this.logs.slice(0, 50);
    
    const summary = {
      totalOperations: recentLogs.length,
      successful: recentLogs.filter(log => 
        log.data?.status === 'UPLOADED_TO_FIREBASE'
      ).length,
      failed: recentLogs.filter(log => 
        log.data?.status === 'UPLOAD_FAILED' || log.level === 'ERROR'
      ).length,
      pending: recentLogs.filter(log => 
        log.data?.status === 'PENDING'
      ).length,
      lastSync: recentLogs.find(log => 
        log.category === 'SYNC' && log.data?.status === 'UPLOADED_TO_FIREBASE'
      )?.timestamp || 'Never',
      recentErrors: recentLogs.filter(log => 
        log.level === 'ERROR'
      ).slice(0, 5)
    };

    console.log('📊 Firebase Upload Status:', summary);
    return summary;
  }

  /**
   * Get detailed logs
   * Lấy logs chi tiết
   */
  getLogs(category = null, level = null, limit = 20) {
    let filteredLogs = this.logs;

    if (category) {
      filteredLogs = filteredLogs.filter(log => 
        log.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (level) {
      filteredLogs = filteredLogs.filter(log => 
        log.level.toLowerCase() === level.toLowerCase()
      );
    }

    return filteredLogs.slice(0, limit);
  }

  /**
   * Clear logs
   * Xóa logs
   */
  clearLogs() {
    this.logs = [];
    this.saveToStorage();
    console.log('🗑️ Firebase logs cleared');
  }

  /**
   * Export logs
   * Xuất logs
   */
  exportLogs() {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalLogs: this.logs.length,
      logs: this.logs
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firebase-logs-${Date.now()}.json`;
    a.click();
    
    console.log('📁 Firebase logs exported');
  }

  /**
   * Save to localStorage
   * Lưu vào localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem('firebaseLogs', JSON.stringify(this.logs.slice(0, 50)));
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  /**
   * Load from localStorage
   * Tải từ localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('firebaseLogs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  /**
   * Enable/disable logging
   * Bật/tắt logging
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`🔧 Firebase logging ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Create singleton instance
const firebaseLogger = new FirebaseLogger();

// Load existing logs
firebaseLogger.loadFromStorage();

// Make available globally
if (typeof window !== 'undefined') {
  window.getFirebaseUploadStatus = () => firebaseLogger.getUploadStatus();
  window.getFirebaseLogs = (category, level, limit) => firebaseLogger.getLogs(category, level, limit);
  window.clearFirebaseLogs = () => firebaseLogger.clearLogs();
  window.exportFirebaseLogs = () => firebaseLogger.exportLogs();
}

export default firebaseLogger;
