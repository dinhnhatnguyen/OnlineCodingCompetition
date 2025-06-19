package oj.onlineCodingCompetition.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.CreateCommentRequest;
import oj.onlineCodingCompetition.dto.ProblemCommentDTO;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.ProblemComment;
import oj.onlineCodingCompetition.repository.ProblemCommentRepository;
import oj.onlineCodingCompetition.repository.ProblemRepository;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ProblemCommentService {

    private final ProblemCommentRepository commentRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    /**
     * Tạo comment mới
     */
    public ProblemCommentDTO createComment(CreateCommentRequest request, String username) {
        log.debug("Tạo comment mới cho problem {} bởi user {}", request.getProblemId(), username);

        // Tìm user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));

        // Tìm problem
        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy problem với ID: " + request.getProblemId()));

        if (problem.isDeleted()) {
            throw new RuntimeException("Problem đã bị xóa");
        }

        // Tạo comment
        ProblemComment comment = new ProblemComment();
        comment.setProblem(problem);
        comment.setUser(user);
        comment.setContent(request.getContent());
        comment.setCreatedAt(LocalDateTime.now());

        // Xử lý parent comment nếu có (reply)
        if (request.getParentCommentId() != null) {
            ProblemComment parentComment = commentRepository.findByIdAndDeletedFalse(request.getParentCommentId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy parent comment"));
            
            // Kiểm tra parent comment cùng problem
            if (!parentComment.getProblem().getId().equals(request.getProblemId())) {
                throw new RuntimeException("Parent comment không thuộc cùng problem");
            }
            
            comment.setParentComment(parentComment);
        }

        ProblemComment savedComment = commentRepository.save(comment);
        log.info("Đã tạo comment với ID: {}", savedComment.getId());

        return convertToDTO(savedComment, user);
    }

    /**
     * Lấy danh sách comments của một problem
     */
    @Transactional(readOnly = true)
    public Page<ProblemCommentDTO> getCommentsByProblem(Long problemId, int page, int size, String currentUsername) {
        log.debug("Lấy comments cho problem {} - page: {}, size: {}", problemId, page, size);

        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy problem với ID: " + problemId));

        final User currentUser = currentUsername != null
            ? userRepository.findByUsername(currentUsername).orElse(null)
            : null;

        Pageable pageable = PageRequest.of(page, size);
        Page<ProblemComment> comments = commentRepository.findByProblemAndParentCommentIsNullAndDeletedFalse(problem, pageable);

        return comments.map(comment -> convertToDTO(comment, currentUser));
    }

    /**
     * Lấy replies của một comment
     */
    @Transactional(readOnly = true)
    public List<ProblemCommentDTO> getRepliesByComment(Long commentId, String currentUsername) {
        log.debug("Lấy replies cho comment {}", commentId);

        ProblemComment parentComment = commentRepository.findByIdAndDeletedFalse(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy comment"));

        final User currentUser = currentUsername != null
            ? userRepository.findByUsername(currentUsername).orElse(null)
            : null;

        List<ProblemComment> replies = commentRepository.findByParentCommentAndDeletedFalseOrderByCreatedAtAsc(parentComment);

        return replies.stream()
                .map(reply -> convertToDTO(reply, currentUser))
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật comment
     */
    public ProblemCommentDTO updateComment(Long commentId, String newContent, String username) {
        log.debug("Cập nhật comment {} bởi user {}", commentId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));

        ProblemComment comment = commentRepository.findByIdAndDeletedFalse(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy comment"));

        // Kiểm tra quyền sửa (chỉ chủ comment hoặc admin)
        if (!comment.getUser().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            throw new RuntimeException("Bạn không có quyền sửa comment này");
        }

        comment.setContent(newContent);
        comment.setUpdatedAt(LocalDateTime.now());

        ProblemComment updatedComment = commentRepository.save(comment);
        log.info("Đã cập nhật comment với ID: {}", updatedComment.getId());

        return convertToDTO(updatedComment, user);
    }

    /**
     * Xóa comment (soft delete)
     */
    public void deleteComment(Long commentId, String username) {
        log.debug("Xóa comment {} bởi user {}", commentId, username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user: " + username));

        ProblemComment comment = commentRepository.findByIdAndDeletedFalse(commentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy comment"));

        // Kiểm tra quyền xóa (chỉ chủ comment hoặc admin)
        if (!comment.getUser().getId().equals(user.getId()) && !"admin".equals(user.getRole())) {
            throw new RuntimeException("Bạn không có quyền xóa comment này");
        }

        comment.setDeleted(true);
        comment.setDeletedAt(LocalDateTime.now());
        comment.setDeletedBy(user.getId());

        commentRepository.save(comment);
        log.info("Đã xóa comment với ID: {}", commentId);
    }

    /**
     * Đếm số lượng comments của một problem
     */
    @Transactional(readOnly = true)
    public Long countCommentsByProblem(Long problemId) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy problem với ID: " + problemId));
        
        return commentRepository.countByProblemAndDeletedFalse(problem);
    }

    /**
     * Convert entity to DTO
     */
    private ProblemCommentDTO convertToDTO(ProblemComment comment, User currentUser) {
        ProblemCommentDTO dto = new ProblemCommentDTO();
        dto.setId(comment.getId());
        dto.setProblemId(comment.getProblem().getId());
        dto.setUserId(comment.getUser().getId());
        dto.setUsername(comment.getUser().getUsername());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUpdatedAt(comment.getUpdatedAt());
        dto.setParentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
        dto.setReply(comment.isReply());
        dto.setReplyCount(comment.getReplies() != null ? comment.getReplies().size() : 0);

        // Set permissions
        if (currentUser != null) {
            dto.setCanEdit(comment.getUser().getId().equals(currentUser.getId()) || "admin".equals(currentUser.getRole()));
            dto.setCanDelete(comment.getUser().getId().equals(currentUser.getId()) || "admin".equals(currentUser.getRole()));
        } else {
            dto.setCanEdit(false);
            dto.setCanDelete(false);
        }

        return dto;
    }
}
