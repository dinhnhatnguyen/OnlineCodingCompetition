package oj.onlineCodingCompetition.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import oj.onlineCodingCompetition.entity.TestCaseResult;

import java.util.List;

@Repository
public interface TestCaseResultRepository extends JpaRepository<TestCaseResult, Long> {
    List<TestCaseResult> findBySubmissionId(Long submissionId);
    List<TestCaseResult> findBySubmissionIdAndTestCaseIdIn(Long submissionId, List<Long> testCaseIds);
    void deleteBySubmissionId(Long submissionId);
}