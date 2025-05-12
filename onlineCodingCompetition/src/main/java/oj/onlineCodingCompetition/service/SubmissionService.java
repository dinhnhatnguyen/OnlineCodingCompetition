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
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.Submission;
import oj.onlineCodingCompetition.repository.ProblemRepository;
import oj.onlineCodingCompetition.repository.SubmissionRepository;
import oj.onlineCodingCompetition.repository.TestCaseRepository;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;


@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;
    private final TestCaseRepository testCaseRepository;
    private final ModelMapper modelMapper;
    private final AmazonSQS amazonSQS;

    @Value("${aws.sqs.queue-url}")
    private String queueUrl;

    private final ObjectMapper objectMapper;

    @Transactional
    public SubmissionDTO createSubmission(SubmissionDTO submissionDTO, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        Problem problem = problemRepository.findById(submissionDTO.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found: " + submissionDTO.getProblemId()));

        Submission submission = new Submission();
        submission.setProblem(problem);
        submission.setUser(user);
        submission.setLanguage(submissionDTO.getLanguage());
        submission.setSourceCode(submissionDTO.getSourceCode());
        submission.setStatus(Submission.SubmissionStatus.PENDING);
        submission.setSubmittedAt(LocalDateTime.now());
        submission.setTotalTestCases(testCaseRepository.countByProblemId(submissionDTO.getProblemId()));
        submission.setCompileError("");

        Submission savedSubmission = submissionRepository.save(submission);

        try {
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

            String messageId = amazonSQS.sendMessage(sendMessageRequest).getMessageId();
            savedSubmission.setQueueMessageId(messageId); // Lưu ID thực của message
            submissionRepository.save(savedSubmission);

            log.info("Submission {} đã được gửi đến SQS, đang chờ worker xử lý", savedSubmission.getId());
        } catch (Exception e) {
            log.error("Failed to send submission {} to SQS", savedSubmission.getId(), e);
            throw new RuntimeException("Failed to send submission to SQS", e);
        }

        return convertToDTO(savedSubmission);
    }


    @Transactional(readOnly = true)
    public SubmissionDTO getSubmissionById(Long id) {

        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found: " + id));
        return convertToDTO(submission);
    }


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

}