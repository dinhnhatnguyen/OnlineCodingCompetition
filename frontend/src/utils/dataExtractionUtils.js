/**
 * Data Extraction Utilities
 * Tiện ích trích xuất dữ liệu
 */

/**
 * Extract data types from test cases
 * Trích xuất kiểu dữ liệu từ test cases
 */
export const extractDataTypesFromTestCases = (testCases) => {
  const dataTypes = new Set();
  
  testCases.forEach(testCase => {
    try {
      if (testCase.inputData) {
        const inputData = JSON.parse(testCase.inputData);
        if (Array.isArray(inputData)) {
          dataTypes.add('Array');
          inputData.forEach(item => {
            if (item.dataType) {
              dataTypes.add(item.dataType);
            }
            // Detect data type from value
            if (item.input !== undefined) {
              const detectedType = detectDataType(item.input);
              if (detectedType) {
                dataTypes.add(detectedType);
              }
            }
          });
        }
      }
      
      if (testCase.expectedOutputData) {
        const outputData = JSON.parse(testCase.expectedOutputData);
        if (outputData.expectedOutput !== undefined) {
          const detectedType = detectDataType(outputData.expectedOutput);
          if (detectedType) {
            dataTypes.add(detectedType);
          }
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
  });
  
  return Array.from(dataTypes);
};

/**
 * Extract topics from problem
 * Trích xuất chủ đề từ bài toán
 */
export const extractTopicsFromProblem = (problem) => {
  if (!problem) return [];
  
  const topics = [];
  
  // Direct topics
  if (problem.topics && Array.isArray(problem.topics)) {
    topics.push(...problem.topics);
  }
  
  // Extract from description
  if (problem.description) {
    const extractedTopics = extractTopicsFromText(problem.description);
    topics.push(...extractedTopics);
  }
  
  // Extract from title
  if (problem.title) {
    const extractedTopics = extractTopicsFromText(problem.title);
    topics.push(...extractedTopics);
  }
  
  // Remove duplicates and return
  return [...new Set(topics)];
};

/**
 * Map difficulty to Vietnamese
 * Chuyển đổi độ khó sang tiếng Việt
 */
export const mapDifficultyToVietnamese = (difficulty) => {
  const mapping = {
    'easy': 'Dễ',
    'medium': 'Trung bình',
    'hard': 'Khó',
    'beginner': 'Người mới bắt đầu',
    'intermediate': 'Trung cấp',
    'advanced': 'Nâng cao'
  };
  
  return mapping[difficulty?.toLowerCase()] || difficulty || 'Không xác định';
};

/**
 * Map language to Vietnamese
 * Chuyển đổi ngôn ngữ sang tiếng Việt
 */
export const mapLanguageToVietnamese = (language) => {
  const mapping = {
    'java': 'Java',
    'python': 'Python',
    'javascript': 'JavaScript',
    'cpp': 'C++',
    'c': 'C',
    'csharp': 'C#',
    'go': 'Go',
    'rust': 'Rust',
    'kotlin': 'Kotlin',
    'swift': 'Swift'
  };
  
  return mapping[language?.toLowerCase()] || language || 'Không xác định';
};

/**
 * Calculate time spent
 * Tính thời gian đã dành
 */
export const calculateTimeSpent = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return Math.floor((end - start) / 1000); // seconds
};

/**
 * Format time duration
 * Format thời lượng
 */
export const formatTimeDuration = (seconds) => {
  if (seconds < 60) {
    return `${seconds} giây`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes} phút ${remainingSeconds} giây` : `${minutes} phút`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
  }
};

/**
 * Validate data collection payload
 * Xác thực payload thu thập dữ liệu
 */
export const validateDataCollectionPayload = (payload) => {
  const errors = [];
  
  if (!payload.userId || typeof payload.userId !== 'number') {
    errors.push('userId is required and must be a number');
  }
  
  if (!payload.problemId || typeof payload.problemId !== 'number') {
    errors.push('problemId is required and must be a number');
  }
  
  if (!payload.activityType || typeof payload.activityType !== 'string') {
    errors.push('activityType is required and must be a string');
  }
  
  if (payload.timeSpentSeconds !== undefined && typeof payload.timeSpentSeconds !== 'number') {
    errors.push('timeSpentSeconds must be a number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize data for storage
 * Làm sạch dữ liệu để lưu trữ
 */
export const sanitizeDataForStorage = (data) => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      if (typeof value === 'string') {
        // Remove potentially harmful characters
        sanitized[key] = value.replace(/[<>]/g, '');
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeDataForStorage(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

/**
 * Generate session ID
 * Tạo session ID
 */
export const generateSessionId = (userId, problemId, timestamp = Date.now()) => {
  return `${userId}_${problemId}_${timestamp}`;
};

/**
 * Parse user ID from JWT token
 * Phân tích user ID từ JWT token
 */
export const parseUserIdFromToken = (token) => {
  try {
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.sub || null;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

// Helper functions

/**
 * Detect data type from value
 * Phát hiện kiểu dữ liệu từ giá trị
 */
const detectDataType = (value) => {
  if (Array.isArray(value)) {
    return 'Array';
  } else if (typeof value === 'string') {
    return 'String';
  } else if (typeof value === 'number') {
    return Number.isInteger(value) ? 'Integer' : 'Float';
  } else if (typeof value === 'boolean') {
    return 'Boolean';
  } else if (value === null) {
    return 'Null';
  } else if (typeof value === 'object') {
    return 'Object';
  }
  
  return null;
};

/**
 * Extract topics from text
 * Trích xuất chủ đề từ văn bản
 */
const extractTopicsFromText = (text) => {
  const topics = [];
  const lowerText = text.toLowerCase();
  
  // Common programming topics
  const topicKeywords = {
    'Array': ['array', 'mảng', 'list', 'danh sách'],
    'String': ['string', 'chuỗi', 'text', 'văn bản'],
    'Tree': ['tree', 'cây', 'binary tree', 'cây nhị phân'],
    'Graph': ['graph', 'đồ thị', 'node', 'edge'],
    'Dynamic Programming': ['dynamic programming', 'quy hoạch động', 'dp'],
    'Sorting': ['sort', 'sắp xếp', 'order', 'thứ tự'],
    'Searching': ['search', 'tìm kiếm', 'find', 'tìm'],
    'Math': ['math', 'toán', 'calculation', 'tính toán'],
    'Recursion': ['recursion', 'đệ quy', 'recursive'],
    'Hash Table': ['hash', 'băm', 'dictionary', 'từ điển']
  };
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      topics.push(topic);
    }
  }
  
  return topics;
};
