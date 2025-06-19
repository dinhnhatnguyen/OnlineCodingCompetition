package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.ContestRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContestRegistrationRepository extends JpaRepository<ContestRegistration, Long> {
    Optional<ContestRegistration> findByContestIdAndUserId(Long contestId, Long userId);
    List<ContestRegistration> findByContestId(Long contestId);
    List<ContestRegistration> findByUserId(Long userId);
    List<ContestRegistration> findByContestIdOrderByTotalScoreDesc(Long contestId);

    // Find user registrations for non-deleted contests only
    @Query("SELECT cr FROM ContestRegistration cr WHERE cr.user.id = :userId AND cr.contest.deleted = false")
    List<ContestRegistration> findByUserIdAndContestNotDeleted(@Param("userId") Long userId);

    long countByContestIdAndStatus(Long contestId, ContestRegistration.RegistrationStatus status);
}