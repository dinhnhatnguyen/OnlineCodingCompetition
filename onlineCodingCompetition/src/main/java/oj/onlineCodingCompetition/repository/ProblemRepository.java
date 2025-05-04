package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemRepository extends JpaRepository<Problem, Long> {

    List<Problem> findByDifficulty(String difficulty);

    @Query("SELECT p FROM Problem p WHERE :topic MEMBER OF p.topics")
    List<Problem> findByTopic(@Param("topic") String topic);

    List<Problem> findByTitleContainingIgnoreCase(String titleKeyword);

    @Query("SELECT DISTINCT p.topics FROM Problem p")
    List<String> findAllTopics();
}