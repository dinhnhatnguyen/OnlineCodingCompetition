package oj.onlineCodingCompetition.repository;

import oj.onlineCodingCompetition.entity.Contest;
import oj.onlineCodingCompetition.security.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContestRepository extends JpaRepository<Contest, Long> {
    
    /**
     * Tìm tất cả cuộc thi do một người dùng cụ thể tạo ra
     * @param createdBy Người dùng đã tạo cuộc thi
     * @return Danh sách các cuộc thi do người dùng tạo ra
     */
    List<Contest> findByCreatedBy(User createdBy);
}