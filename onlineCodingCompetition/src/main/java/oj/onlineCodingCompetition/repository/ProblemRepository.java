package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository <Problem, Long>{
    List<Problem> findByDifficulty(String difficulty);

    @Query("SELECT p FROM Problem p JOIN p.topics t WHERE t = :topic")
    List<Problem> findByTopic(@Param("topic") String topic);

    @Query("SELECT p FROM Problem p WHERE p.title LIKE %:search% OR p.description LIKE %:search%")
    List<Problem> findByTitleOrDescriptionContaining(@Param("search") String search);
}
