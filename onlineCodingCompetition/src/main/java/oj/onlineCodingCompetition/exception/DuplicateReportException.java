package oj.onlineCodingCompetition.exception;

public class DuplicateReportException extends RuntimeException {
    public DuplicateReportException(String message) {
        super(message);
    }
    
    public DuplicateReportException(String message, Throwable cause) {
        super(message, cause);
    }
}
