package oj.onlineCodingCompetition.dto.response;

public class CodeExecutionResponse {
    private String status;  // SUCCESS, ERROR, TIME_LIMIT_EXCEEDED, etc.
    private String output;  // Program output or error message
    private Integer exitCode;  // Optional exit code

    // Getters and setters
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    public Integer getExitCode() {
        return exitCode;
    }

    public void setExitCode(Integer exitCode) {
        this.exitCode = exitCode;
    }
}
