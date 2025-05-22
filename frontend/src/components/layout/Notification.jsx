import React, { useState, useEffect } from "react";

const Notification = ({ message, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [message, duration, onClose]);

  if (!message || !isVisible) return null;

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600";
      case "error":
        return "bg-red-600";
      case "warning":
        return "bg-yellow-600";
      case "info":
      default:
        return "bg-blue-600";
    }
  };

  return (
    <div className={`fixed top-20 right-4 z-50 animate-fade-in-down`}>
      <div
        className={`${getBgColor()} text-white px-4 py-3 rounded-md shadow-lg flex items-center`}
      >
        <span className="flex-grow">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="ml-3 text-white"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default Notification;
