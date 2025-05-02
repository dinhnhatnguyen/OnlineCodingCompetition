package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.Contest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ContestRepository extends JpaRepository <Contest, Long> {
    @Query("SELECT c FROM Contest c WHERE c.isActive = true AND c.startTime <= :now AND c.endTime >= :now")
    List<Contest> findActiveContests(LocalDateTime now);

    @Query("SELECT c FROM Contest c WHERE c.isActive = false OR c.startTime > :now OR c.endTime < :now")
    List<Contest> findInactiveContests(LocalDateTime now);

    List<Contest> findByCreatedById(Long userId);

}
