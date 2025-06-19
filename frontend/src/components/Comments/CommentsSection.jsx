import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useToast } from "../../contexts/ToastContext";
import {
  getCommentsByProblem,
  createComment,
  getRepliesByComment,
  countCommentsByProblem,
} from "../../api/commentsApi";
import CommentItem from "./CommentItem";

const CommentsSection = ({ problemId, user: propUser }) => {
  const { user: contextUser } = useAuth();
  const user = propUser || contextUser; // Use prop user if provided, otherwise context user
  const { currentLanguage } = useLanguage();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [commentsWithReplies, setCommentsWithReplies] = useState({});

  const translations = {
    vi: {
      discussionTitle: "Thảo luận về bài toán",
      writeComment: "Viết bình luận...",
      postComment: "Đăng bình luận",
      loginToComment: "Đăng nhập để bình luận",
      loadMore: "Tải thêm",
      noComments: "Chưa có bình luận nào. Hãy là người đầu tiên!",
      commentsCount: "bình luận",
      showReplies: "Hiển thị phản hồi",
      hideReplies: "Ẩn phản hồi",
      loadingComments: "Đang tải bình luận...",
      commentSuccess: "Đăng bình luận thành công",
    },
    en: {
      discussionTitle: "Problem Discussion",
      writeComment: "Write a comment...",
      postComment: "Post Comment",
      loginToComment: "Login to comment",
      loadMore: "Load More",
      noComments: "No comments yet. Be the first!",
      commentsCount: "comments",
      showReplies: "Show replies",
      hideReplies: "Hide replies",
      loadingComments: "Loading comments...",
      commentSuccess: "Comment posted successfully",
    },
  };

  const t = translations[currentLanguage] || translations.en; // Fallback to English

  useEffect(() => {
    loadComments();
    loadCommentsCount();
  }, [problemId]);

  const loadComments = async (page = 0) => {
    setIsLoading(true);
    try {
      const response = await getCommentsByProblem(problemId, page, 10);
      if (page === 0) {
        setComments(response.content);
      } else {
        setComments((prev) => [...prev, ...response.content]);
      }
      setCurrentPage(response.number);
      setTotalPages(response.totalPages);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCommentsCount = async () => {
    try {
      const count = await countCommentsByProblem(problemId);
      setTotalComments(count);
    } catch (error) {
      console.error("Error loading comments count:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (newComment.trim() === "") return;

    setIsSubmitting(true);
    try {
      const commentData = {
        problemId: problemId,
        content: newComment,
      };
      const createdComment = await createComment(commentData);
      setComments((prev) => [createdComment, ...prev]);
      setNewComment("");
      setTotalComments((prev) => prev + 1);
      showToast(t.commentSuccess, "success");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentCommentId, content) => {
    const replyData = {
      problemId: problemId,
      content: content,
      parentCommentId: parentCommentId,
    };
    const createdReply = await createComment(replyData);

    // Add reply to the parent comment's replies
    setCommentsWithReplies((prev) => ({
      ...prev,
      [parentCommentId]: [...(prev[parentCommentId] || []), createdReply],
    }));

    setTotalComments((prev) => prev + 1);
  };

  const handleUpdateComment = (updatedComment) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment
      )
    );
  };

  const handleDeleteComment = (commentId) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
    setTotalComments((prev) => prev - 1);
  };

  const loadReplies = async (commentId) => {
    if (commentsWithReplies[commentId]) {
      // Hide replies
      setCommentsWithReplies((prev) => {
        const newState = { ...prev };
        delete newState[commentId];
        return newState;
      });
    } else {
      // Load replies
      try {
        const replies = await getRepliesByComment(commentId);
        setCommentsWithReplies((prev) => ({
          ...prev,
          [commentId]: replies,
        }));
      } catch (error) {
        showToast(error.message, "error");
      }
    }
  };

  return (
    <div className="comments-section mt-8">
      <div className="bg-zinc-900 rounded-lg shadow-sm border border-zinc-700 p-6">
        <h3 className="text-xl font-semibold mb-4 text-white">
          {t.discussionTitle} ({totalComments} {t.commentsCount})
        </h3>

        {/* Comment form */}
        {user ? (
          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t.writeComment}
              className="w-full p-3 bg-zinc-800 border border-zinc-600 rounded-md resize-none text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              disabled={isSubmitting}
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={handleSubmitComment}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                disabled={isSubmitting || newComment.trim() === ""}
              >
                {t.postComment}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-zinc-800 border border-zinc-600 rounded-md text-center">
            <p className="text-gray-400">{t.loginToComment}</p>
            <a
              href="/login"
              className="text-blue-400 hover:text-blue-300 underline mt-2 inline-block"
            >
              Đăng nhập ngay
            </a>
          </div>
        )}

        {/* Comments list */}
        {isLoading && comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 ml-2">{t.loadingComments}</p>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 mb-2">
              <svg
                className="w-12 h-12 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <p className="text-gray-400">{t.noComments}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id}>
                <CommentItem
                  comment={comment}
                  onReply={handleReply}
                  onUpdate={handleUpdateComment}
                  onDelete={handleDeleteComment}
                  level={0}
                />

                {/* Show replies button */}
                {comment.replyCount > 0 && (
                  <div className="ml-8 mb-2">
                    <button
                      onClick={() => loadReplies(comment.id)}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      {commentsWithReplies[comment.id]
                        ? t.hideReplies
                        : `${t.showReplies} (${comment.replyCount})`}
                    </button>
                  </div>
                )}

                {/* Replies */}
                {commentsWithReplies[comment.id] && (
                  <div className="ml-8">
                    {commentsWithReplies[comment.id].map((reply) => (
                      <CommentItem
                        key={reply.id}
                        comment={reply}
                        onReply={handleReply}
                        onUpdate={handleUpdateComment}
                        onDelete={handleDeleteComment}
                        level={1}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Load more button */}
            {currentPage < totalPages - 1 && (
              <div className="text-center mt-6">
                <button
                  onClick={() => loadComments(currentPage + 1)}
                  className="px-6 py-2 bg-zinc-700 text-gray-300 rounded-md hover:bg-zinc-600 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300 mr-2"></div>
                      Đang tải...
                    </div>
                  ) : (
                    t.loadMore
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsSection;
