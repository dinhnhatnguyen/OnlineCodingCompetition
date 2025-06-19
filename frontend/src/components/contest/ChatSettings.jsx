import React, { useState } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../../contexts/ToastContext";
import { toggleContestChat } from "../../api/contestChatApi";

const ChatSettings = ({ contestId, chatEnabled, onChatToggle, canManage = false }) => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const translations = {
    vi: {
      chatSettings: "Cài đặt Chat",
      enableChat: "Bật chat cho cuộc thi",
      disableChat: "Tắt chat cho cuộc thi",
      chatEnabled: "Chat đã được bật",
      chatDisabled: "Chat đã bị tắt",
      chatDescription: "Cho phép người tham gia giao tiếp trong cuộc thi",
      toggleSuccess: "Cập nhật cài đặt chat thành công",
      noPermission: "Bạn không có quyền thay đổi cài đặt này",
    },
    en: {
      chatSettings: "Chat Settings",
      enableChat: "Enable chat for contest",
      disableChat: "Disable chat for contest",
      chatEnabled: "Chat is enabled",
      chatDisabled: "Chat is disabled",
      chatDescription: "Allow participants to communicate during the contest",
      toggleSuccess: "Chat settings updated successfully",
      noPermission: "You don't have permission to change this setting",
    },
  };

  const t = translations[language];

  const handleToggleChat = async () => {
    if (!canManage) {
      showToast(t.noPermission, "error");
      return;
    }

    setIsUpdating(true);
    try {
      const newState = !chatEnabled;
      await toggleContestChat(contestId, newState);
      onChatToggle(newState);
      showToast(t.toggleSuccess, "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">{t.chatSettings}</h3>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${chatEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="font-medium text-gray-900">
                {chatEnabled ? t.chatEnabled : t.chatDisabled}
              </p>
              <p className="text-sm text-gray-600">{t.chatDescription}</p>
            </div>
          </div>
        </div>
        
        {canManage && (
          <button
            onClick={handleToggleChat}
            disabled={isUpdating}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              chatEnabled
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            } disabled:opacity-50`}
          >
            {isUpdating
              ? "..."
              : chatEnabled
              ? t.disableChat
              : t.enableChat}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatSettings;
