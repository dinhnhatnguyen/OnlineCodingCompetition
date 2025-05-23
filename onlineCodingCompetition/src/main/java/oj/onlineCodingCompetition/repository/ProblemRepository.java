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

    List<Problem> findByDifficulty(String difficulty);

    // Query để tìm các bài toán có chứa topic cụ thể
    @Query("SELECT p FROM Problem p JOIN p.topics t WHERE t = :topic")
    List<Problem> findByTopicsContaining(String topic);

    List<Problem> findByTitleContainingIgnoreCase(String keyword);

    // Lấy danh sách các topic đã được sử dụng
    @Query("SELECT DISTINCT t FROM Problem p JOIN p.topics t ORDER BY t")
    List<String> findAllTopics();

    // Tương thích với phương thức cũ
    @Query("SELECT p FROM Problem p JOIN p.topics t WHERE t = :topic")
    List<Problem> findByTopic(String topic);

    // Add method to fetch the problem with function signatures eagerly loaded
    @Query("SELECT p FROM Problem p LEFT JOIN FETCH p.functionSignatures WHERE p.id = :id")
    Optional<Problem> findByIdWithFunctionSignatures(@Param("id") Long id);
    
    // Tìm problem theo người tạo
    List<Problem> findByCreatedBy(User creator);
}