package oj.onlineCodingCompetition.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import oj.onlineCodingCompetition.entity.Submission;
import oj.onlineCodingCompetition.entity.Submission.SubmissionStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByUserIdOrderBySubmittedAtDesc(Long userId);
    List<Submission> findByProblemIdOrderBySubmittedAtDesc(Long problemId);
    List<Submission> findByUserIdAndProblemIdOrderBySubmittedAtDesc(Long userId, Long problemId);
    List<Submission> findByStatusOrderBySubmittedAtAsc(SubmissionStatus status);
    Page<Submission> findByUserIdOrderBySubmittedAtDesc(Long userId, Pageable pageable);
    Page<Submission> findByProblemIdOrderBySubmittedAtDesc(Long problemId, Pageable pageable);
    List<Submission> findTop5ByUserIdAndProblemIdOrderBySubmittedAtDesc(Long userId, Long problemId);

    List<Submission> findByContestIdAndUserIdOrderBySubmittedAtDesc(Long contestId, Long userId);

    List<Submission> findByContestIdOrderByScoreDescSubmittedAtAsc(Long contestId);

    List<Submission> findByContestIdAndProblemIdOrderByScoreDescSubmittedAtAsc(Long contestId, Long problemId);
    
    List<Submission> findByContestIdAndUserIdAndProblemIdOrderByScoreDescSubmittedAtAsc(Long contestId, Long userId, Long problemId);

    // For analytics
    long countByProblemIdAndStatus(Long problemId, SubmissionStatus status);
    long countByUserId(Long userId);
}
