package oj.onlineCodingCompetition.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.security.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    @Query("SELECT p FROM Problem p WHERE p.deleted = false")
    List<Problem> findAllActive();

    @Query("SELECT p FROM Problem p WHERE p.difficulty = :difficulty AND p.deleted = false")
    List<Problem> findByDifficultyAndDeletedFalse(String difficulty);

    // Query để tìm các bài toán có chứa topic cụ thể
    @Query("SELECT p FROM Problem p JOIN p.topics t WHERE t = :topic AND p.deleted = false")
    List<Problem> findByTopicsContaining(String topic);

    @Query("SELECT p FROM Problem p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) AND p.deleted = false")
    List<Problem> findByTitleContainingIgnoreCaseAndDeletedFalse(String keyword);

    // Lấy danh sách các topic đã được sử dụng
    @Query("SELECT DISTINCT t FROM Problem p JOIN p.topics t WHERE p.deleted = false ORDER BY t")
    List<String> findAllTopics();

    // Tương thích với phương thức cũ
    @Query("SELECT p FROM Problem p JOIN p.topics t WHERE t = :topic AND p.deleted = false")
    List<Problem> findByTopic(String topic);

    // Add method to fetch the problem with function signatures eagerly loaded
    @Query("SELECT p FROM Problem p LEFT JOIN FETCH p.functionSignatures WHERE p.id = :id AND p.deleted = false")
    Optional<Problem> findByIdWithFunctionSignatures(@Param("id") Long id);
    
    // Tìm problem theo người tạo
    @Query("SELECT p FROM Problem p WHERE p.createdBy = :creator AND p.deleted = false")
    List<Problem> findByCreatedByAndDeletedFalse(User creator);

    // Override default findById to exclude deleted problems
    @Query("SELECT p FROM Problem p WHERE p.id = :id AND p.deleted = false")
    Optional<Problem> findById(@Param("id") Long id);

    // Override default findAll to exclude deleted problems
    @Query("SELECT p FROM Problem p WHERE p.deleted = false")
    List<Problem> findAll();

    // Tìm bài toán theo contest
    @Query("SELECT p FROM Problem p JOIN p.contests c WHERE c.id = :contestId AND p.deleted = false")
    List<Problem> findByContestIdAndDeletedFalse(Long contestId);
}