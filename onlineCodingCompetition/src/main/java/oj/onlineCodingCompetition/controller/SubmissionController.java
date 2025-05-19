package oj.onlineCodingCompetition.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import oj.onlineCodingCompetition.dto.SubmissionDTO;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import oj.onlineCodingCompetition.service.SubmissionService;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
@Tag(name = "Submission", description = "API để quản lý submission")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<SubmissionDTO> createSubmission(
            @Valid @RequestBody SubmissionDTO submissionDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();
        SubmissionDTO createdSubmission = submissionService.createSubmission(submissionDTO, userId);
        return new ResponseEntity<>(createdSubmission, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionDTO> getSubmissionById(@PathVariable Long id) {
        return ResponseEntity.ok(submissionService.getSubmissionById(id));
    }
}