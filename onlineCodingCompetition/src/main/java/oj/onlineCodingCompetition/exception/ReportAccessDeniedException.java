package oj.onlineCodingCompetition.exception;

public class ReportAccessDeniedException extends RuntimeException {
    public ReportAccessDeniedException(String message) {
        super(message);
    }
    
    public ReportAccessDeniedException(String message, Throwable cause) {
        super(message, cause);
    }
}
