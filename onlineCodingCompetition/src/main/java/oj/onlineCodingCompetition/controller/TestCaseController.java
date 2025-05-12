package oj.onlineCodingCompetition.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import oj.onlineCodingCompetition.dto.TestCaseDTO;
import oj.onlineCodingCompetition.service.TestCaseService;

import java.util.List;

@RestController
@RequestMapping("/api/test-cases")
@RequiredArgsConstructor
public class TestCaseController {

    private final TestCaseService testCaseService;

    @GetMapping("/{id}")
    public ResponseEntity<TestCaseDTO> getTestCaseById(@PathVariable Long id) {
        return ResponseEntity.ok(testCaseService.getTestCaseById(id));
    }

    @GetMapping("/problem/{problemId}")
    public ResponseEntity<List<TestCaseDTO>> getAllTestCasesByProblemId(@PathVariable Long problemId) {
        return ResponseEntity.ok(testCaseService.getAllTestCasesByProblemId(problemId));
    }

    @GetMapping("/problem/{problemId}/examples")
    public ResponseEntity<List<TestCaseDTO>> getExampleTestCasesByProblemId(@PathVariable Long problemId) {
        return ResponseEntity.ok(testCaseService.getExampleTestCasesByProblemId(problemId));
    }

    @GetMapping("/problem/{problemId}/visible")
    public ResponseEntity<List<TestCaseDTO>> getVisibleTestCasesByProblemId(@PathVariable Long problemId) {
        return ResponseEntity.ok(testCaseService.getVisibleTestCasesByProblemId(problemId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<TestCaseDTO> createTestCase(@Valid @RequestBody TestCaseDTO testCaseDTO) throws JsonProcessingException {
        TestCaseDTO createdTestCase = testCaseService.createTestCase(testCaseDTO);
        return new ResponseEntity<>(createdTestCase, HttpStatus.CREATED);
    }

    @PostMapping("/batch/{problemId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<TestCaseDTO>> createTestCases(
            @PathVariable Long problemId,
            @Valid @RequestBody List<TestCaseDTO> testCaseDTOs) {
        List<TestCaseDTO> createdTestCases = testCaseService.createTestCases(testCaseDTOs, problemId);
        return new ResponseEntity<>(createdTestCases, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<TestCaseDTO> updateTestCase(
            @PathVariable Long id,
            @Valid @RequestBody TestCaseDTO testCaseDTO) throws JsonProcessingException {
        return ResponseEntity.ok(testCaseService.updateTestCase(id, testCaseDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteTestCase(@PathVariable Long id) {
        testCaseService.deleteTestCase(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/problem/{problemId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteAllTestCasesByProblemId(@PathVariable Long problemId) {
        testCaseService.deleteAllTestCasesByProblemId(problemId);
        return ResponseEntity.noContent().build();
    }
}