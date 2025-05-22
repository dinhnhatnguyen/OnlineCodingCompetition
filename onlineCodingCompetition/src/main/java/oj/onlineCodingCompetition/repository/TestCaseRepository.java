package oj.onlineCodingCompetition.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import oj.onlineCodingCompetition.entity.TestCase;

import java.util.List;

@Repository
public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByProblemIdOrderByTestOrderAsc(Long problemId);

    List<TestCase> findByProblemIdAndIsExampleTrueOrderByTestOrderAsc(Long problemId);

    List<TestCase> findByProblemIdAndIsHiddenFalseOrderByTestOrderAsc(Long problemId);

    Integer countByProblemId(Long problemId);
}