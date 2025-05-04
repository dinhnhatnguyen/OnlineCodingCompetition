package oj.onlineCodingCompetition.controller;

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

    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<TestCaseDTO> createTestCase(@Valid @RequestBody TestCaseDTO testCaseDTO) {
        TestCaseDTO createdTestCase = testCaseService.createTestCase(testCaseDTO);
        return new ResponseEntity<>(createdTestCase, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<TestCaseDTO> updateTestCase(
            @PathVariable Long id,
            @Valid @RequestBody TestCaseDTO testCaseDTO) {
        return ResponseEntity.ok(testCaseService.updateTestCase(id, testCaseDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteTestCase(@PathVariable Long id) {
        testCaseService.deleteTestCase(id);
        return ResponseEntity.noContent().build();
    }
}