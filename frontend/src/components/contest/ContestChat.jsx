import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../../contexts/ToastContext";
import {
  getRecentMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
  getMessagesAfter,
} from "../../api/contestChatApi";

const ContestChat = ({ contestId, contestTitle, chatEnabled = true }) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");
  const messagesEndRef = useRef(null);
  const lastMessageTimeRef = useRef(null);

  const translations = {
    vi: {
      chatTitle: "Chat cuộc thi",
      chatDisabled: "Chat đã bị tắt cho cuộc thi này",
      writeMessage: "Viết tin nhắn...",
      sendMessage: "Gửi",
      edit: "Sửa",
      delete: "Xóa",
      save: "Lưu",
      cancel: "Hủy",
      loginToChat: "Đăng nhập để tham gia chat",
      noMessages: "Chưa có tin nhắn nào. Hãy là người đầu tiên!",
      messageSuccess: "Gửi tin nhắn thành công",
      updateSuccess: "Cập nhật tin nhắn thành công",
      deleteSuccess: "Xóa tin nhắn thành công",
      confirmDelete: "Bạn có chắc chắn muốn xóa tin nhắn này?",
      announcement: "Thông báo",
    },
    en: {
      chatTitle: "Contest Chat",
      chatDisabled: "Chat is disabled for this contest",
      writeMessage: "Write a message...",
      sendMessage: "Send",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      loginToChat: "Login to join the chat",
      noMessages: "No messages yet. Be the first!",
      messageSuccess: "Message sent successfully",
      updateSuccess: "Message updated successfully",
      deleteSuccess: "Message deleted successfully",
      confirmDelete: "Are you sure you want to delete this message?",
      announcement: "Announcement",
    },
  };

  const t = translations[language];

  useEffect(() => {
    if (chatEnabled) {
      loadMessages();
      // Set up polling for new messages every 5 seconds
      const interval = setInterval(checkForNewMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [contestId, chatEnabled]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const messageList = await getRecentMessages(contestId, 50);
      setMessages(messageList);
      if (messageList.length > 0) {
        lastMessageTimeRef.current = new Date(messageList[messageList.length - 1].createdAt);
      }
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const checkForNewMessages = async () => {
    if (!user || !lastMessageTimeRef.current) return;

    try {
      const newMessages = await getMessagesAfter(contestId, lastMessageTimeRef.current);
      if (newMessages.length > 0) {
        setMessages(prev => [...prev, ...newMessages]);
        lastMessageTimeRef.current = new Date(newMessages[newMessages.length - 1].createdAt);
      }
    } catch (error) {
      // Silently fail for polling
      console.error("Error checking for new messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const messageData = {
        contestId: contestId,
        message: newMessage,
        messageType: "NORMAL",
      };
      const sentMessage = await sendMessage(messageData);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");
      lastMessageTimeRef.current = new Date(sentMessage.createdAt);
      showToast(t.messageSuccess, "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editContent.trim()) return;

    try {
      const updatedMessage = await updateMessage(messageId, editContent);
      setMessages(prev =>
        prev.map(msg => (msg.id === messageId ? updatedMessage : msg))
      );
      setEditingMessage(null);
      setEditContent("");
      showToast(t.updateSuccess, "success");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm(t.confirmDelete)) return;

    try {
      await deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      showToast(t.deleteSuccess, "success");
    } catch (error) {
      showToast(error.message, "error");
    }
  };

  const startEditing = (message) => {
    setEditingMessage(message.id);
    setEditContent(message.message);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (dateString) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: language === "vi" ? vi : undefined,
    });
  };

  if (!chatEnabled) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">{t.chatTitle}</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">{t.chatDisabled}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">{t.chatTitle}</h3>
        <div className="text-center py-8">
          <p className="text-gray-500">{t.loginToChat}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">{t.chatTitle}</h3>
        {contestTitle && (
          <p className="text-sm text-gray-600">{contestTitle}</p>
        )}
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t.noMessages}</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              {/* Avatar */}
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {message.username.charAt(0).toUpperCase()}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {message.username}
                  </span>
                  {message.isAnnouncement && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {t.announcement}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatTime(message.createdAt)}
                    {message.updatedAt && (
                      <span className="ml-1">(đã chỉnh sửa)</span>
                    )}
                  </span>
                </div>

                {/* Message Text */}
                {editingMessage === message.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md resize-none"
                      rows="2"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditMessage(message.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        disabled={!editContent.trim()}
                      >
                        {t.save}
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {message.message}
                    </p>
                    
                    {/* Message Actions */}
                    {(message.canEdit || message.canDelete) && (
                      <div className="flex space-x-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {message.canEdit && (
                          <button
                            onClick={() => startEditing(message)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            {t.edit}
                          </button>
                        )}
                        {message.canDelete && (
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            {t.delete}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t.writeMessage}
            className="flex-1 p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="2"
            disabled={isSending}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={isSending || !newMessage.trim()}
          >
            {isSending ? "..." : t.sendMessage}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContestChat;
