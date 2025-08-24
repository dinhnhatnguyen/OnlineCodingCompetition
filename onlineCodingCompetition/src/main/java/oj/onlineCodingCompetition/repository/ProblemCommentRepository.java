package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.ProblemComment;
import oj.onlineCodingCompetition.security.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemCommentRepository extends JpaRepository<ProblemComment, Long> {

    /**
     * Tìm tất cả comments của một problem (không bao gồm replies)
     * @param problem Problem entity
     * @param pageable Pagination info
     * @return Page of comments
     */
    @Query("SELECT pc FROM ProblemComment pc WHERE pc.problem = :problem AND pc.parentComment IS NULL AND pc.deleted = false ORDER BY pc.createdAt ASC")
    Page<ProblemComment> findByProblemAndParentCommentIsNullAndDeletedFalse(@Param("problem") Problem problem, Pageable pageable);

    /**
     * Tìm tất cả replies của một comment
     * @param parentComment Parent comment
     * @return List of replies
     */
    @Query("SELECT pc FROM ProblemComment pc WHERE pc.parentComment = :parentComment AND pc.deleted = false ORDER BY pc.createdAt ASC")
    List<ProblemComment> findByParentCommentAndDeletedFalseOrderByCreatedAtAsc(@Param("parentComment") ProblemComment parentComment);

    /**
     * Đếm số lượng comments của một problem
     * @param problem Problem entity
     * @return Number of comments
     */
    @Query("SELECT COUNT(pc) FROM ProblemComment pc WHERE pc.problem = :problem AND pc.deleted = false")
    Long countByProblemAndDeletedFalse(@Param("problem") Problem problem);

    /**
     * Tìm comments của một user trong một problem
     * @param problem Problem entity
     * @param user User entity
     * @return List of comments
     */
    @Query("SELECT pc FROM ProblemComment pc WHERE pc.problem = :problem AND pc.user = :user AND pc.deleted = false ORDER BY pc.createdAt DESC")
    List<ProblemComment> findByProblemAndUserAndDeletedFalseOrderByCreatedAtDesc(@Param("problem") Problem problem, @Param("user") User user);

    /**
     * Tìm comment theo ID và kiểm tra không bị xóa
     * @param id Comment ID
     * @return Optional comment
     */
    @Query("SELECT pc FROM ProblemComment pc WHERE pc.id = :id AND pc.deleted = false")
    Optional<ProblemComment> findByIdAndDeletedFalse(@Param("id") Long id);

    /**
     * Tìm tất cả comments của một problem (bao gồm cả replies) để load eager
     * @param problem Problem entity
     * @return List of all comments
     */
    @Query("SELECT pc FROM ProblemComment pc LEFT JOIN FETCH pc.replies WHERE pc.problem = :problem AND pc.deleted = false ORDER BY pc.createdAt ASC")
    List<ProblemComment> findByProblemWithReplies(@Param("problem") Problem problem);
}
