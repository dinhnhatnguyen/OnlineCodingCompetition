import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { updateComment, deleteComment } from "../../api/commentsApi";
import { useToast } from "../../contexts/ToastContext";

const CommentItem = ({ comment, onReply, onUpdate, onDelete, level = 0 }) => {
  const { user } = useAuth();
  const { currentLanguage } = useLanguage();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const translations = {
    vi: {
      reply: "Trả lời",
      edit: "Sửa",
      delete: "Xóa",
      save: "Lưu",
      cancel: "Hủy",
      writeReply: "Viết phản hồi...",
      confirmDelete: "Bạn có chắc chắn muốn xóa comment này?",
      updateSuccess: "Cập nhật comment thành công",
      deleteSuccess: "Xóa comment thành công",
      replySuccess: "Trả lời thành công",
    },
    en: {
      reply: "Reply",
      edit: "Edit",
      delete: "Delete",
      save: "Save",
      cancel: "Cancel",
      writeReply: "Write a reply...",
      confirmDelete: "Are you sure you want to delete this comment?",
      updateSuccess: "Comment updated successfully",
      deleteSuccess: "Comment deleted successfully",
      replySuccess: "Reply posted successfully",
    },
  };

  const t = translations[currentLanguage] || translations.en; // Fallback to English

  const handleEdit = async () => {
    if (editContent.trim() === "") return;

    setIsLoading(true);
    try {
      const updatedComment = await updateComment(comment.id, editContent);
      onUpdate(updatedComment);
      setIsEditing(false);
      showToast(t.updateSuccess, "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t.confirmDelete)) return;

    setIsLoading(true);
    try {
      await deleteComment(comment.id);
      onDelete(comment.id);
      showToast(t.deleteSuccess, "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async () => {
    if (replyContent.trim() === "") return;

    setIsLoading(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
      showToast(t.replySuccess, "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: currentLanguage === "vi" ? vi : undefined,
    });
  };

  return (
    <div className={`comment-item ${level > 0 ? "ml-8" : ""}`}>
      <div className="bg-zinc-800 rounded-lg shadow-sm border border-zinc-700 p-4 mb-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {comment.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-medium text-white">{comment.username}</span>
              <span className="text-gray-400 text-sm ml-2">
                {formatTime(comment.createdAt)}
                {comment.updatedAt && (
                  <span className="ml-1">(đã chỉnh sửa)</span>
                )}
              </span>
            </div>
          </div>

          {/* Actions */}
          {user && (
            <div
              className="flex items-center space-x-2"
              style={{ gap: "10px" }}
            >
              {comment.canEdit && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  disabled={isLoading}
                >
                  {isEditing ? t.cancel : t.edit}
                </button>
              )}
              {comment.canDelete && (
                <button
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                  disabled={isLoading}
                >
                  {t.delete}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-3">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-md resize-none text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                disabled={isLoading}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={isLoading || editContent.trim() === ""}
                >
                  {t.save}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-4 py-2 bg-zinc-600 text-gray-300 rounded-md text-sm hover:bg-zinc-500 transition-colors"
                  disabled={isLoading}
                >
                  {t.cancel}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
              {comment.content}
            </p>
          )}
        </div>

        {/* Reply button */}
        {user && !isEditing && level < 2 && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
            disabled={isLoading}
          >
            {t.reply}
          </button>
        )}

        {/* Reply form */}
        {showReplyForm && (
          <div className="mt-4 p-3 bg-zinc-700 rounded-md border border-zinc-600">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={t.writeReply}
              className="w-full p-3 bg-zinc-600 border border-zinc-500 rounded-md resize-none text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="2"
              disabled={isLoading}
            />
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleReply}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isLoading || replyContent.trim() === ""}
              >
                {t.reply}
              </button>
              <button
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent("");
                }}
                className="px-4 py-2 bg-zinc-600 text-gray-300 rounded-md text-sm hover:bg-zinc-500 transition-colors"
                disabled={isLoading}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
