package oj.onlineCodingCompetition.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import oj.onlineCodingCompetition.entity.UserSolvedProblem;
import oj.onlineCodingCompetition.security.entity.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSolvedProblemRepository extends JpaRepository<UserSolvedProblem, Long> {
    List<UserSolvedProblem> findByUserId(Long userId);
    
    Optional<UserSolvedProblem> findByUserIdAndProblemId(Long userId, Long problemId);
    
    boolean existsByUserIdAndProblemId(Long userId, Long problemId);
} 