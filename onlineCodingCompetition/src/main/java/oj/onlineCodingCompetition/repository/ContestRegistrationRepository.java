package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.ContestRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContestRegistrationRepository extends JpaRepository<ContestRegistration, Long> {
    Optional<ContestRegistration> findByContestIdAndUserId(Long contestId, Long userId);
    List<ContestRegistration> findByContestId(Long contestId);
    List<ContestRegistration> findByContestIdOrderByTotalScoreDesc(Long contestId);

    long countByContestIdAndStatus(Long contestId, ContestRegistration.RegistrationStatus status);
}