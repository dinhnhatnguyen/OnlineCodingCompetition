package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.Contest;
import oj.onlineCodingCompetition.security.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContestRepository extends JpaRepository<Contest, Long> {
    
    /**
     * Tìm các cuộc thi do người dùng tạo
     * @param createdBy người tạo cuộc thi
     * @return danh sách cuộc thi
     */
    List<Contest> findByCreatedBy(User createdBy);

    // Override findById to exclude deleted contests
    @Query("SELECT c FROM Contest c WHERE c.id = :id AND c.deleted = false")
    Optional<Contest> findById(@Param("id") Long id);

    // Override findAll to exclude deleted contests
    @Query("SELECT c FROM Contest c WHERE c.deleted = false")
    List<Contest> findAll();

    // Find all active contests (not deleted)
    @Query("SELECT c FROM Contest c WHERE c.deleted = false")
    List<Contest> findAllActive();

    // Find by creator and not deleted
    @Query("SELECT c FROM Contest c WHERE c.createdBy = :creator AND c.deleted = false")
    List<Contest> findByCreatedByAndDeletedFalse(@Param("creator") User creator);

    // Find public contests that are not deleted
    @Query("SELECT c FROM Contest c WHERE c.isPublic = true AND c.deleted = false")
    List<Contest> findPublicContests();

    // Find contests by status and not deleted
    @Query("SELECT c FROM Contest c WHERE c.status = :status AND c.deleted = false")
    List<Contest> findByStatusAndDeletedFalse(@Param("status") Contest.ContestStatus status);
}