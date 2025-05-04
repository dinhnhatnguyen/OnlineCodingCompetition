package oj.onlineCodingCompetition.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import oj.onlineCodingCompetition.dto.ProblemDTO;
import oj.onlineCodingCompetition.dto.ProblemWithTestCasesDTO;
import oj.onlineCodingCompetition.dto.TestCaseDTO;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import oj.onlineCodingCompetition.service.ProblemService;
import oj.onlineCodingCompetition.service.TestCaseService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;
    private final TestCaseService testCaseService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProblems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<ProblemDTO> problemsPage = problemService.getProblemsPage(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("problems", problemsPage.getContent());
        response.put("currentPage", problemsPage.getNumber());
        response.put("totalItems", problemsPage.getTotalElements());
        response.put("totalPages", problemsPage.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProblemDTO> getProblemById(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ProblemDTO> createProblem(
            @Valid @RequestBody ProblemDTO problemDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        ProblemDTO createdProblem = problemService.createProblem(problemDTO, userId);
        return new ResponseEntity<>(createdProblem, HttpStatus.CREATED);
    }

    @PostMapping("/with-test-cases")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<?> createProblemWithTestCases(
            @Valid @RequestBody ProblemWithTestCasesDTO requestDTO,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Extract problem data and test cases from DTO
        ProblemDTO problemDTO = requestDTO.getProblem();
        List<TestCaseDTO> testCases = requestDTO.getTestCases();

        // Validate minimum test case requirement (even though now done at DTO level)
        if (testCases == null || testCases.size() < 2) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "At least 2 test cases are required");
            return ResponseEntity.badRequest().body(errorResponse);
        }

        Long userId = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        ProblemDTO createdProblem = problemService.createProblemWithTestCases(problemDTO, testCases, userId);
        return new ResponseEntity<>(createdProblem, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ProblemDTO> updateProblem(
            @PathVariable Long id,
            @Valid @RequestBody ProblemDTO problemDTO) {

        return ResponseEntity.ok(problemService.updateProblem(id, problemDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<ProblemDTO>> getProblemsByDifficulty(@PathVariable String difficulty) {
        return ResponseEntity.ok(problemService.getProblemsByDifficulty(difficulty));
    }

    @GetMapping("/topic/{topic}")
    public ResponseEntity<List<ProblemDTO>> getProblemsByTopic(@PathVariable String topic) {
        return ResponseEntity.ok(problemService.getProblemsByTopic(topic));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProblemDTO>> searchProblems(@RequestParam String title) {
        return ResponseEntity.ok(problemService.searchProblemsByTitle(title));
    }

    @GetMapping("/topics")
    public ResponseEntity<List<String>> getAllTopics() {
        return ResponseEntity.ok(problemService.getAllTopics());
    }

    // Test case related endpoints

    @GetMapping("/{id}/test-cases")
    public ResponseEntity<List<TestCaseDTO>> getVisibleTestCases(@PathVariable Long id) {
        return ResponseEntity.ok(testCaseService.getVisibleTestCasesByProblemId(id));
    }

    @GetMapping("/{id}/examples")
    public ResponseEntity<List<TestCaseDTO>> getExampleTestCases(@PathVariable Long id) {
        return ResponseEntity.ok(testCaseService.getExampleTestCasesByProblemId(id));
    }

    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    @GetMapping("/{id}/all-test-cases")
    public ResponseEntity<List<TestCaseDTO>> getAllTestCases(@PathVariable Long id) {
        return ResponseEntity.ok(testCaseService.getAllTestCasesByProblemId(id));
    }

    @PostMapping("/{id}/test-cases")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<TestCaseDTO>> addTestCasesToProblem(
            @PathVariable Long id,
            @Valid @RequestBody List<TestCaseDTO> testCaseDTOs) {

        List<TestCaseDTO> createdTestCases = testCaseService.createTestCases(testCaseDTOs, id);
        return new ResponseEntity<>(createdTestCases, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}/test-cases")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteAllTestCasesForProblem(@PathVariable Long id) {
        testCaseService.deleteAllTestCasesByProblemId(id);
        return ResponseEntity.noContent().build();
    }
}