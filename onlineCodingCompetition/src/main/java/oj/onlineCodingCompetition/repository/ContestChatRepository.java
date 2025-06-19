package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.Contest;
import oj.onlineCodingCompetition.entity.ContestChat;
import oj.onlineCodingCompetition.security.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContestChatRepository extends JpaRepository<ContestChat, Long> {

    /**
     * Tìm tất cả messages của một contest
     * @param contest Contest entity
     * @param pageable Pagination info
     * @return Page of chat messages
     */
    @Query("SELECT cc FROM ContestChat cc WHERE cc.contest = :contest AND cc.deleted = false ORDER BY cc.createdAt ASC")
    Page<ContestChat> findByContestAndDeletedFalse(@Param("contest") Contest contest, Pageable pageable);

    /**
     * Tìm messages mới nhất của một contest
     * @param contest Contest entity
     * @param limit Number of messages to retrieve
     * @return List of recent messages
     */
    @Query("SELECT cc FROM ContestChat cc WHERE cc.contest = :contest AND cc.deleted = false ORDER BY cc.createdAt DESC")
    List<ContestChat> findRecentMessagesByContest(@Param("contest") Contest contest, Pageable pageable);

    /**
     * Tìm messages sau một thời điểm cụ thể (để real-time update)
     * @param contest Contest entity
     * @param since Timestamp to get messages after
     * @return List of messages
     */
    @Query("SELECT cc FROM ContestChat cc WHERE cc.contest = :contest AND cc.createdAt > :since AND cc.deleted = false ORDER BY cc.createdAt ASC")
    List<ContestChat> findByContestAndCreatedAtAfterAndDeletedFalse(@Param("contest") Contest contest, @Param("since") LocalDateTime since);

    /**
     * Tìm messages của một user trong contest
     * @param contest Contest entity
     * @param user User entity
     * @param pageable Pagination info
     * @return Page of messages
     */
    @Query("SELECT cc FROM ContestChat cc WHERE cc.contest = :contest AND cc.user = :user AND cc.deleted = false ORDER BY cc.createdAt DESC")
    Page<ContestChat> findByContestAndUserAndDeletedFalse(@Param("contest") Contest contest, @Param("user") User user, Pageable pageable);

    /**
     * Đếm số lượng messages trong contest
     * @param contest Contest entity
     * @return Number of messages
     */
    @Query("SELECT COUNT(cc) FROM ContestChat cc WHERE cc.contest = :contest AND cc.deleted = false")
    Long countByContestAndDeletedFalse(@Param("contest") Contest contest);

    /**
     * Tìm message theo ID và kiểm tra không bị xóa
     * @param id Message ID
     * @return Optional message
     */
    @Query("SELECT cc FROM ContestChat cc WHERE cc.id = :id AND cc.deleted = false")
    Optional<ContestChat> findByIdAndDeletedFalse(@Param("id") Long id);

    /**
     * Tìm announcements của contest
     * @param contest Contest entity
     * @return List of announcements
     */
    @Query("SELECT cc FROM ContestChat cc WHERE cc.contest = :contest AND cc.messageType = 'ANNOUNCEMENT' AND cc.deleted = false ORDER BY cc.createdAt DESC")
    List<ContestChat> findAnnouncementsByContest(@Param("contest") Contest contest);

    /**
     * Xóa tất cả messages cũ hơn một thời điểm (cleanup)
     * @param before Timestamp to delete messages before
     * @return Number of deleted messages
     */
    @Query("UPDATE ContestChat cc SET cc.deleted = true, cc.deletedAt = CURRENT_TIMESTAMP WHERE cc.createdAt < :before")
    int deleteOldMessages(@Param("before") LocalDateTime before);
}
