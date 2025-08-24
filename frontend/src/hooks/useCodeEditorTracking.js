import { useEffect, useRef, useCallback } from "react";
import offlineDataCollector from "../services/offlineDataCollector";

/**
 * Custom hook for tracking code editor activity (Offline-First)
 * Hook tùy chỉnh để theo dõi hoạt động code editor (offline-first)
 */
export const useCodeEditorTracking = (language, initialCode = "") => {
  const editorRef = useRef(null);
  const isTrackingRef = useRef(false);
  const lastCodeRef = useRef(initialCode);
  const changeTimeoutRef = useRef(null);
  const keystrokeCountRef = useRef(0);

  /**
   * Initialize editor tracking
   * Khởi tạo theo dõi editor
   */
  const initializeTracking = useCallback((editor) => {
    if (!editor || isTrackingRef.current) return;

    editorRef.current = editor;
    isTrackingRef.current = true;

    console.log("Code editor tracking initialized");

    // Track content changes
    const disposable1 = editor.onDidChangeModelContent((event) => {
      handleContentChange(event);
    });

    // Track cursor position changes
    const disposable2 = editor.onDidChangeCursorPosition((event) => {
      handleCursorChange(event);
    });

    // Track focus events
    const disposable3 = editor.onDidFocusEditorText(() => {
      handleEditorFocus();
    });

    // Track blur events
    const disposable4 = editor.onDidBlurEditorText(() => {
      handleEditorBlur();
    });

    // Cleanup function
    return () => {
      disposable1.dispose();
      disposable2.dispose();
      disposable3.dispose();
      disposable4.dispose();
      isTrackingRef.current = false;
    };
  }, []);

  /**
   * Handle content change in editor
   * Xử lý thay đổi nội dung trong editor
   */
  const handleContentChange = useCallback(
    (event) => {
      if (!isTrackingRef.current) return;

      const currentCode = editorRef.current?.getValue() || "";
      const previousCode = lastCodeRef.current;

      // Skip if no actual change
      if (currentCode === previousCode) return;

      keystrokeCountRef.current++;
      lastCodeRef.current = currentCode;

      // Record code changes using simple collector
      if (previousCode.trim() === "" && currentCode.trim() !== "") {
        console.log("First meaningful keystroke detected");
      }

      // Debounced code change recording
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }

      changeTimeoutRef.current = setTimeout(() => {
        offlineDataCollector.recordCodeChange(currentCode, language);
      }, 1000); // 1 second debounce

      // Track significant changes
      if (isSignificantChange(previousCode, currentCode)) {
        recordSignificantChange(previousCode, currentCode);
      }
    },
    [language]
  );

  /**
   * Handle cursor position change
   * Xử lý thay đổi vị trí con trỏ
   */
  const handleCursorChange = useCallback((event) => {
    // Can be used for advanced tracking like navigation patterns
    // For now, just log for debugging
    // console.log('Cursor position changed:', event.position);
  }, []);

  /**
   * Handle editor focus
   * Xử lý khi editor được focus
   */
  const handleEditorFocus = useCallback(() => {
    console.log("Editor focused - user started coding session");
    // Could record when user starts actively coding
  }, []);

  /**
   * Handle editor blur
   * Xử lý khi editor mất focus
   */
  const handleEditorBlur = useCallback(() => {
    console.log("Editor blurred - user paused coding");
    // Could record coding pauses
  }, []);

  /**
   * Check if change is significant
   * Kiểm tra xem thay đổi có đáng kể không
   */
  const isSignificantChange = useCallback((oldCode, newCode) => {
    const oldLines = oldCode.split("\n").length;
    const newLines = newCode.split("\n").length;
    const lineDiff = Math.abs(newLines - oldLines);

    const oldLength = oldCode.length;
    const newLength = newCode.length;
    const lengthDiff = Math.abs(newLength - oldLength);

    // Consider significant if:
    // - Line count changed by more than 2
    // - Character count changed by more than 50
    // - Code went from empty to non-empty or vice versa
    return (
      lineDiff > 2 ||
      lengthDiff > 50 ||
      (oldCode.trim() === "" && newCode.trim() !== "") ||
      (oldCode.trim() !== "" && newCode.trim() === "")
    );
  }, []);

  /**
   * Record significant change
   * Ghi lại thay đổi đáng kể
   */
  const recordSignificantChange = useCallback((oldCode, newCode) => {
    const changeType = determineChangeType(oldCode, newCode);
    console.log(`Significant change detected: ${changeType}`);

    // Could send this data to analytics
    // enhancedDataCollectionService.recordSignificantChange({
    //   type: changeType,
    //   oldLength: oldCode.length,
    //   newLength: newCode.length,
    //   timestamp: Date.now()
    // });
  }, []);

  /**
   * Determine type of change
   * Xác định loại thay đổi
   */
  const determineChangeType = useCallback((oldCode, newCode) => {
    if (oldCode.trim() === "" && newCode.trim() !== "") {
      return "STARTED_CODING";
    }
    if (oldCode.trim() !== "" && newCode.trim() === "") {
      return "CLEARED_CODE";
    }
    if (newCode.length > oldCode.length * 1.5) {
      return "MAJOR_ADDITION";
    }
    if (newCode.length < oldCode.length * 0.5) {
      return "MAJOR_DELETION";
    }
    return "MODIFICATION";
  }, []);

  /**
   * Get current editor statistics
   * Lấy thống kê editor hiện tại
   */
  const getEditorStats = useCallback(() => {
    const currentCode = editorRef.current?.getValue() || "";

    return {
      codeLength: currentCode.length,
      lineCount: currentCode.split("\n").length,
      keystrokeCount: keystrokeCountRef.current,
      isEmpty: currentCode.trim() === "",
      language: language,
    };
  }, [language]);

  /**
   * Reset tracking state
   * Reset trạng thái theo dõi
   */
  const resetTracking = useCallback(() => {
    keystrokeCountRef.current = 0;
    lastCodeRef.current = "";

    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
      changeTimeoutRef.current = null;
    }

    console.log("Editor tracking reset");
  }, []);

  /**
   * Force save current state
   * Buộc lưu trạng thái hiện tại
   */
  const forceSave = useCallback(() => {
    if (editorRef.current) {
      const currentCode = editorRef.current.getValue();
      offlineDataCollector.recordCodeChange(currentCode, language);
    }
  }, [language]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
      isTrackingRef.current = false;
    };
  }, []);

  // Update language when it changes
  useEffect(() => {
    if (isTrackingRef.current && editorRef.current) {
      const currentCode = editorRef.current.getValue();
      if (currentCode.trim() !== "") {
        offlineDataCollector.recordCodeChange(currentCode, language);
      }
    }
  }, [language]);

  return {
    initializeTracking,
    getEditorStats,
    resetTracking,
    forceSave,
    isTracking: isTrackingRef.current,
  };
};
