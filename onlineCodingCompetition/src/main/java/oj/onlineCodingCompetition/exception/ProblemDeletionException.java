package oj.onlineCodingCompetition.exception;

import oj.onlineCodingCompetition.dto.ContestDTO;

import java.util.List;

/**
 * Exception thrown when a problem cannot be deleted due to active contest constraints
 * Exception được ném khi không thể xóa bài toán do ràng buộc cuộc thi đang hoạt động
 */
public class ProblemDeletionException extends RuntimeException {
    
    private final List<ContestDTO> activeContests;
    
    public ProblemDeletionException(String message, List<ContestDTO> activeContests) {
        super(message);
        this.activeContests = activeContests;
    }
    
    public List<ContestDTO> getActiveContests() {
        return activeContests;
    }
}
