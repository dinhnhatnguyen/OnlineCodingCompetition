import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message) => {
      addToast(message, "success");
    },
    [addToast]
  );

  const showError = useCallback(
    (message) => {
      addToast(message, "error");
    },
    [addToast]
  );

  const showWarning = useCallback(
    (message) => {
      addToast(message, "warning");
    },
    [addToast]
  );

  const showInfo = useCallback(
    (message) => {
      addToast(message, "info");
    },
    [addToast]
  );

  const showToast = useCallback(
    (message, type = "info") => {
      addToast(message, type);
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ showSuccess, showError, showWarning, showInfo, showToast }}
    >
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-4">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
