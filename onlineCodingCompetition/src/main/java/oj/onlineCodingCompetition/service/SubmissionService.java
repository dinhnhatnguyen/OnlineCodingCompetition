package oj.onlineCodingCompetition.service;

import com.amazonaws.services.sqs.AmazonSQS;
import com.amazonaws.services.sqs.model.SendMessageRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import oj.onlineCodingCompetition.dto.SubmissionDTO;
import oj.onlineCodingCompetition.dto.TestCaseResultDTO;
import oj.onlineCodingCompetition.entity.Contest;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.Submission;
import oj.onlineCodingCompetition.entity.TestCaseResult;
import oj.onlineCodingCompetition.entity.UserSolvedProblem;
import oj.onlineCodingCompetition.repository.ContestRepository;
import oj.onlineCodingCompetition.repository.ProblemRepository;
import oj.onlineCodingCompetition.repository.SubmissionRepository;
import oj.onlineCodingCompetition.repository.TestCaseRepository;
import oj.onlineCodingCompetition.repository.TestCaseResultRepository;
import oj.onlineCodingCompetition.repository.UserSolvedProblemRepository;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing code submissions in the system.
 * Service quản lý các bài nộp code trong hệ thống.
 *
 * Main features / Tính năng chính:
 * - Submission processing / Xử lý bài nộp
 * - Queue management / Quản lý hàng đợi
 * - Contest integration / Tích hợp với cuộc thi
 * - Result tracking / Theo dõi kết quả
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final TestCaseRepository testCaseRepository;
    private final TestCaseResultRepository testCaseResultRepository;
    private final UserSolvedProblemRepository userSolvedProblemRepository;
    private final ContestRepository contestRepository;
    private final ModelMapper modelMapper;
    private final AmazonSQS amazonSQS;
    private final ContestService contestService;

    @Value("${aws.sqs.queue-url}")
    private String queueUrl;

    private final ObjectMapper objectMapper;

    /**
     * Creates a new submission and sends it to processing queue
     * Tạo mới bài nộp và gửi vào hàng đợi xử lý
     * 
     * Steps / Các bước:
     * 1. Validate submission / Kiểm tra tính hợp lệ
     * 2. Save to database / Lưu vào database
     * 3. Send to SQS queue / Gửi vào hàng đợi SQS
     */
    @Transactional
    public SubmissionDTO createSubmission(SubmissionDTO submissionDTO, Long userId) {
        log.debug("Creating submission for user {} with payload: {}", userId, submissionDTO);
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            Problem problem = problemRepository.findById(submissionDTO.getProblemId())
                    .orElseThrow(() -> new RuntimeException("Problem not found: " + submissionDTO.getProblemId()));

            // Nếu submission thuộc về một cuộc thi, kiểm tra quyền tham gia
            Contest contest = null;
            if (submissionDTO.getContestId() != null) {
                contest = contestRepository.findById(submissionDTO.getContestId())
                    .orElseThrow(() -> new RuntimeException("Contest not found: " + submissionDTO.getContestId()));

                log.debug("Checking contest participation for user {} in contest {}", userId, contest.getId());
                
                // Kiểm tra thời gian cuộc thi
                LocalDateTime now = LocalDateTime.now();
                if (now.isBefore(contest.getStartTime())) {
                    throw new RuntimeException("Cuộc thi chưa bắt đầu");
                }
                if (now.isAfter(contest.getEndTime())) {
                    throw new RuntimeException("Cuộc thi đã kết thúc");
                }

                // Kiểm tra xem bài toán có thuộc cuộc thi không
                if (!contest.getProblems().contains(problem)) {
                    throw new RuntimeException("Bài toán không thuộc cuộc thi này");
                }

                // Cho phép tham gia nếu cuộc thi public và đang diễn ra
                if (contest.isPublic() && contest.getStatus() == Contest.ContestStatus.ONGOING) {
                    // Tự động tạo registration nếu chưa có
                    contestService.updateContestScore(contest.getId(), userId, problem.getId(), 0.0);
                } else if (!contestService.canUserParticipateInContest(contest.getId(), userId)) {
                    throw new RuntimeException("User không có quyền tham gia cuộc thi này");
                }
            }

            log.debug("Creating submission entity");
            Submission submission = new Submission();
            submission.setProblem(problem);
            submission.setUser(user);
            submission.setLanguage(submissionDTO.getLanguage());
            submission.setSourceCode(submissionDTO.getSourceCode());
            submission.setStatus(Submission.SubmissionStatus.PENDING);
            submission.setSubmittedAt(LocalDateTime.now());
            submission.setTotalTestCases(testCaseRepository.countByProblemId(submissionDTO.getProblemId()));
            submission.setCompileError("");
            
            // Liên kết với cuộc thi nếu có
            if (contest != null) {
                submission.setContest(contest);
                log.info("Submission associated with contest ID: {}", contest.getId());
            }

            log.debug("Saving submission to database");
            Submission savedSubmission = submissionRepository.save(submission);

            try {
                log.debug("Preparing message for SQS");
                // Tạo một DTO riêng để gửi qua SQS để tránh vấn đề serialize/deserialize
                Map<String, Object> messageMap = new HashMap<>();
                messageMap.put("submissionId", savedSubmission.getId());
                messageMap.put("problemId", problem.getId());
                messageMap.put("userId", user.getId());
                messageMap.put("language", submission.getLanguage());
                messageMap.put("sourceCode", submission.getSourceCode());

                String messageBody = objectMapper.writeValueAsString(messageMap);

                SendMessageRequest sendMessageRequest = new SendMessageRequest()
                        .withQueueUrl(queueUrl)
                        .withMessageBody(messageBody)
                        .withDelaySeconds(5);

                if (queueUrl.endsWith(".fifo")) {
                    sendMessageRequest
                            .withMessageGroupId("submission-group")
                            .withMessageDeduplicationId(savedSubmission.getId().toString());
                }

                log.debug("Sending message to SQS");
                String messageId = amazonSQS.sendMessage(sendMessageRequest).getMessageId();
                savedSubmission.setQueueMessageId(messageId);
                submissionRepository.save(savedSubmission);

                log.info("Submission {} đã được gửi đến SQS, đang chờ worker xử lý", savedSubmission.getId());
            } catch (Exception e) {
                log.error("Failed to send submission {} to SQS: {}", savedSubmission.getId(), e.getMessage(), e);
                throw new RuntimeException("Failed to send submission to SQS: " + e.getMessage());
            }

            return convertToDTO(savedSubmission);
        } catch (Exception e) {
            log.error("Error creating submission for user {}: {}", userId, e.getMessage(), e);
            throw new RuntimeException("Error creating submission: " + e.getMessage());
        }
    }

    /**
     * Gets submission details by ID
     * Lấy thông tin bài nộp theo ID
     * 
     * Includes / Bao gồm:
     * - Basic info / Thông tin cơ bản
     * - Test results / Kết quả test
     * - Execution metrics / Chỉ số thực thi
     */
    @Transactional(readOnly = true)
    public SubmissionDTO getSubmissionById(Long id) {
        log.debug("Getting submission by ID: {}", id);
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + id));
                
        SubmissionDTO dto = modelMapper.map(submission, SubmissionDTO.class);
        
        // Set problem and user IDs
        dto.setProblemId(submission.getProblem().getId());
        dto.setUserId(submission.getUser().getId());
        
        // Check if this is a timed out submission that should be TIME_LIMIT_EXCEEDED instead of WRONG_ANSWER
        if (submission.getStatus() == Submission.SubmissionStatus.WRONG_ANSWER) {
            // Check if any test cases are TIME_LIMIT_EXCEEDED
            List<TestCaseResult> testCaseResults = testCaseResultRepository.findBySubmissionId(id);
            boolean hasTimedOutTest = testCaseResults.stream()
                    .anyMatch(result -> result.getStatus() == TestCaseResult.TestCaseStatus.TIME_LIMIT_EXCEEDED);
            
            if (hasTimedOutTest) {
                dto.setStatus(Submission.SubmissionStatus.TIME_LIMIT_EXCEEDED.name());
            }
        }
        
        return dto;
    }

    /**
     * Updates submission status and results
     * Cập nhật trạng thái và kết quả bài nộp
     * 
     * Actions / Hành động:
     * - Update status / Cập nhật trạng thái
     * - Record metrics / Ghi nhận chỉ số
     * - Update contest scores / Cập nhật điểm thi
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Retryable(value = {Exception.class}, maxAttempts = 5, backoff = @Backoff(delay = 200))
    public void updateSubmission(Submission submission) {
        log.info("Updating submission {} with status: {}", submission.getId(), submission.getStatus());
        try {
            // Đọc lại submission từ database để tránh vấn đề optimistic locking
            Submission currentSubmission = submissionRepository.findById(submission.getId())
                    .orElseThrow(() -> new RuntimeException("Submission not found: " + submission.getId()));

            // Cập nhật các thông tin cần thiết
            currentSubmission.setStatus(submission.getStatus());
            currentSubmission.setCompletedAt(submission.getCompletedAt());
            currentSubmission.setScore(submission.getScore());
            currentSubmission.setPassedTestCases(submission.getPassedTestCases());
            currentSubmission.setRuntimeMs(submission.getRuntimeMs());
            currentSubmission.setMemoryUsedKb(submission.getMemoryUsedKb());
            currentSubmission.setCompileError(submission.getCompileError());
            currentSubmission.setExecutionEnvironment(submission.getExecutionEnvironment());

            // Lưu submission đã cập nhật
            Submission savedSubmission = submissionRepository.saveAndFlush(currentSubmission);
            log.info("Updated submission {} successfully, new status: {}",
                    savedSubmission.getId(), savedSubmission.getStatus());
            
            // Nếu submission thành công, đánh dấu bài đã giải
            if (Submission.SubmissionStatus.ACCEPTED.equals(savedSubmission.getStatus())) {
                markProblemSolved(savedSubmission.getProblem().getId(), savedSubmission.getUser().getId());
            }
            
            // Nếu submission thuộc về một cuộc thi, cập nhật điểm cho leaderboard
            if (savedSubmission.getContest() != null && savedSubmission.getScore() != null) {
                try {
                    // Cập nhật điểm cho cuộc thi mà không cần kiểm tra đăng ký
                    contestService.updateContestScore(
                        savedSubmission.getContest().getId(),
                        savedSubmission.getUser().getId(),
                        savedSubmission.getProblem().getId(),
                        savedSubmission.getScore()
                    );
                    log.info("Cập nhật điểm cho cuộc thi {} thành công", savedSubmission.getContest().getId());
                } catch (Exception e) {
                    log.error("Lỗi khi cập nhật điểm cho cuộc thi: {}", e.getMessage(), e);
                    // Không throw exception để quá trình xử lý submission tiếp tục
                }
            }
        } catch (Exception e) {
            log.error("Error updating submission {}: {}", submission.getId(), e.getMessage(), e);
            throw e;
        }
    }

    private SubmissionDTO convertToDTO(Submission submission) {
        SubmissionDTO dto = modelMapper.map(submission, SubmissionDTO.class);
        return dto;
    }

    @Transactional(readOnly = true)
    public Submission getSubmissionEntityById(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + id));
    }
    
    /**
     * Marks a problem as solved by user
     * Đánh dấu bài toán đã được giải bởi người dùng
     */
    @Transactional
    public void markProblemSolved(Long problemId, Long userId) {
        // Kiểm tra xem bài đã được đánh dấu là đã giải chưa
        boolean alreadySolved = userSolvedProblemRepository.existsByUserIdAndProblemId(userId, problemId);
        if (!alreadySolved) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));
            Problem problem = problemRepository.findById(problemId)
                    .orElseThrow(() -> new RuntimeException("Problem not found: " + problemId));
                    
            UserSolvedProblem userSolvedProblem = new UserSolvedProblem();
            userSolvedProblem.setUser(user);
            userSolvedProblem.setProblem(problem);
            userSolvedProblem.setSolvedAt(LocalDateTime.now());
            
            userSolvedProblemRepository.save(userSolvedProblem);
            log.info("Marked problem {} as solved for user {}", problemId, userId);
        }
    }
    
    /**
     * Gets list of problems solved by user
     * Lấy danh sách bài toán đã giải của người dùng
     */
    @Transactional(readOnly = true)
    public List<Long> getUserSolvedProblems(Long userId) {
        return userSolvedProblemRepository.findByUserId(userId).stream()
                .map(solved -> solved.getProblem().getId())
                .collect(Collectors.toList());
    }
    
    /**
     * Gets detailed test case results for a submission
     * Lấy kết quả chi tiết các test case của bài nộp
     * 
     * Includes / Bao gồm:
     * - Test status / Trạng thái test
     * - Input/Output / Đầu vào/ra
     * - Error messages / Thông báo lỗi
     */
    @Transactional(readOnly = true)
    public List<TestCaseResultDTO> getTestCaseResults(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + submissionId));
        
        // Lấy tất cả kết quả test case cho submission này
        List<TestCaseResult> testCaseResults = testCaseResultRepository.findBySubmissionId(submissionId);
        
        // Chuyển sang DTO
        return testCaseResults.stream().map(result -> {
            TestCaseResultDTO dto = modelMapper.map(result, TestCaseResultDTO.class);
            
            // Bổ sung thông tin input và expected output từ test case gốc nếu không phải hidden test case
            if (!result.getIsHidden()) {
                try {
                    // Lấy thông tin input và expected output từ test case gốc
                    String input = objectMapper.readTree(result.getTestCase().getInputData()).toString();
                    String expectedOutput = objectMapper.readTree(result.getTestCase().getExpectedOutputData())
                            .get("expectedOutput").asText();
                            
                    dto.setInput(input);
                    dto.setExpectedOutput(expectedOutput);
                } catch (Exception e) {
                    log.error("Error parsing test case data: {}", e.getMessage());
                }
            }
            
            return dto;
        }).collect(Collectors.toList());
    }
}