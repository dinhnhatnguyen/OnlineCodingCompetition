import React, { useEffect } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";

const TOAST_TYPES = {
  success: {
    icon: CheckCircleIcon,
    bgColor: "bg-green-50",
    textColor: "text-green-800",
    borderColor: "border-green-400",
    iconColor: "text-green-400",
  },
  error: {
    icon: XCircleIcon,
    bgColor: "bg-red-50",
    textColor: "text-red-800",
    borderColor: "border-red-400",
    iconColor: "text-red-400",
  },
  warning: {
    icon: ExclamationCircleIcon,
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-800",
    borderColor: "border-yellow-400",
    iconColor: "text-yellow-400",
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: "bg-blue-50",
    textColor: "text-blue-800",
    borderColor: "border-blue-400",
    iconColor: "text-blue-400",
  },
};

const Toast = ({
  message,
  type = "info",
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  const toastStyle = TOAST_TYPES[type];

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const Icon = toastStyle.icon;

  return (
    <div className={`fixed top-4 right-4 z-50 animate-slide-in`}>
      <div
        className={`${toastStyle.bgColor} ${toastStyle.textColor} p-4 rounded-lg shadow-lg border ${toastStyle.borderColor} max-w-md flex items-start gap-3`}
        role="alert"
      >
        <Icon className={`h-5 w-5 ${toastStyle.iconColor} mt-0.5`} />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className={`${toastStyle.textColor} hover:opacity-70 transition-opacity`}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
