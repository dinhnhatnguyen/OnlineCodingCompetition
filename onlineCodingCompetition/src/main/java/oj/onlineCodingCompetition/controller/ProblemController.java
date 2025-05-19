package oj.onlineCodingCompetition.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.entity.Contest;
import oj.onlineCodingCompetition.repository.ContestRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import oj.onlineCodingCompetition.dto.ProblemDTO;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.TestCase;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import oj.onlineCodingCompetition.service.ProblemService;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Problem ", description = "API để quản lý Problem")
public class ProblemController {

    private final ProblemService problemService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final ContestRepository contestRepository;

    @GetMapping
    public ResponseEntity<List<ProblemDTO>> getAllProblems() {
        log.debug("REST request to get all problems");
        return ResponseEntity.ok(problemService.getAllProblems());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<ProblemDTO>> getProblemsPage(Pageable pageable) {
        log.debug("REST request to get a page of problems");
        return ResponseEntity.ok(problemService.getProblemsPage(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProblemDTO> getProblemById(@PathVariable Long id) {
        log.debug("REST request to get problem by ID: {}", id);
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<ProblemDTO>> getProblemsByDifficulty(@PathVariable String difficulty) {
        log.debug("REST request to get problems by difficulty: {}", difficulty);
        return ResponseEntity.ok(problemService.getProblemsByDifficulty(difficulty));
    }

    @GetMapping("/topic/{topic}")
    public ResponseEntity<List<ProblemDTO>> getProblemsByTopic(@PathVariable String topic) {
        log.debug("REST request to get problems by topic: {}", topic);
        return ResponseEntity.ok(problemService.getProblemsByTopic(topic));
    }

    @GetMapping("/topics")
    public ResponseEntity<List<String>> getAllTopics() {
        log.debug("REST request to get all topics");
        return ResponseEntity.ok(problemService.getAllTopics());
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProblemDTO>> searchProblemsByTitle(@RequestParam String keyword) {
        log.debug("REST request to search problems by title keyword: {}", keyword);
        return ResponseEntity.ok(problemService.searchProblemsByTitle(keyword));
    }

    @GetMapping("/{id}/with-test-cases")
    public ResponseEntity<ProblemDTO> getProblemWithTestCases(@PathVariable Long id) {
        log.debug("REST request to get problem with test cases by ID: {}", id);
        return ResponseEntity.ok(problemService.getProblemWithTestCases(id));
    }
    @PostMapping
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ProblemDTO> createProblem(
            @Valid @RequestBody ProblemDTO problemDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.debug("REST request to create problem: {}", problemDTO);
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        ProblemDTO createdProblem = problemService.createProblem(problemDTO, user.getId());
        return new ResponseEntity<>(createdProblem, HttpStatus.CREATED);
    }

    @PostMapping("/with-test-cases")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ProblemDTO> createProblemWithTestCases(
            @RequestBody Map<String, Object> requestBody,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.debug("REST request to create problem with test cases");

        try {
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            @SuppressWarnings("unchecked")
            Map<String, Object> problemData = (Map<String, Object>) requestBody.get("createProblem");

            Problem problem = new Problem();
            problem.setTitle((String) problemData.get("title"));
            problem.setDescription((String) problemData.get("description"));
            problem.setDifficulty((String) problemData.get("difficulty"));
            problem.setConstraints((String) problemData.get("constraints"));

            if (problemData.get("contestId") != null) {
                Long contestId = ((Number) problemData.get("contestId")).longValue();
                problem.setContestId(contestId);
            }

            @SuppressWarnings("unchecked")
            List<String> topics = (List<String>) problemData.get("topics");
            problem.setTopics(new java.util.HashSet<>(topics));

            @SuppressWarnings("unchecked")
            Map<String, Boolean> supportedLanguages = (Map<String, Boolean>) problemData.get("supportedLanguages");
            problem.setSupportedLanguages(supportedLanguages);

            @SuppressWarnings("unchecked")
            Map<String, String> functionSignaturesMap = (Map<String, String>) problemData.get("functionSignatures");
            Map<String, Problem.FunctionSignature> functionSignatures = new HashMap<>();

            if (functionSignaturesMap != null) {
                for (Map.Entry<String, String> entry : functionSignaturesMap.entrySet()) {
                    String language = entry.getKey();
                    String jsonString = entry.getValue();
                    Map<String, Object> signatureData = objectMapper.readValue(jsonString, Map.class);
                    String functionName = (String) signatureData.get("functionName");
                    List<String> parameterTypes = (List<String>) signatureData.get("parameterTypes");
                    String returnType = (String) signatureData.get("returnType");
                    Problem.FunctionSignature signature = new Problem.FunctionSignature(functionName, parameterTypes, returnType);
                    functionSignatures.put(language, signature);
                }
            }
            problem.setFunctionSignatures(functionSignatures);

            List<Long> contestIds = (List<Long>) problemData.get("contestIds");
            List<Contest> contests = new ArrayList<>();
            if (contestIds != null && !contestIds.isEmpty()) {
                contests = contestIds.stream()
                        .map(contestId -> contestRepository.findById(contestId)
                                .orElseThrow(() -> new RuntimeException("Contest not found with id: " + contestId)))
                        .collect(Collectors.toList());
            }
            problem.setContests(contests);

            problem.setCreatedBy(user);
            problem.setCreatedAt(LocalDateTime.now());

            problem.setDefaultTimeLimit(1000);
            problem.setDefaultMemoryLimit(262144);

            problem.setTestCases(new ArrayList<>());

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> testCasesData = (List<Map<String, Object>>) requestBody.get("createTestCases");

            if (testCasesData != null && !testCasesData.isEmpty()) {
                for (Map<String, Object> testCaseData : testCasesData) {
                    TestCase testCase = new TestCase();
                    testCase.setInputData((String) testCaseData.get("inputData"));
                    testCase.setInputType((String) testCaseData.get("inputType"));
                    testCase.setOutputType((String) testCaseData.get("outputType"));
                    testCase.setExpectedOutputData((String) testCaseData.get("expectedOutputData"));
                    testCase.setDescription((String) testCaseData.get("description"));
                    testCase.setIsExample(Boolean.TRUE.equals(testCaseData.get("isExample")));
                    testCase.setIsHidden(Boolean.TRUE.equals(testCaseData.get("isHidden")));

                    if (testCaseData.get("timeLimit") != null) {
                        testCase.setTimeLimit(((Number) testCaseData.get("timeLimit")).intValue());
                    }
                    if (testCaseData.get("memoryLimit") != null) {
                        testCase.setMemoryLimit(((Number) testCaseData.get("memoryLimit")).intValue());
                    }
                    if (testCaseData.get("weight") != null) {
                        testCase.setWeight(((Number) testCaseData.get("weight")).doubleValue());
                    }
                    if (testCaseData.get("testOrder") != null) {
                        testCase.setTestOrder(((Number) testCaseData.get("testOrder")).intValue());
                    }

                    testCase.setComparisonMode((String) testCaseData.get("comparisonMode"));

                    if (testCaseData.get("epsilon") != null) {
                        testCase.setEpsilon(((Number) testCaseData.get("epsilon")).doubleValue());
                    }

                    testCase.setProblem(problem);
                    problem.getTestCases().add(testCase);
                }
            }

            Problem createdProblem = problemService.createProblemWithTestCases(problem);
            ProblemDTO problemDTO = problemService.convertToDTO(createdProblem);

            return new ResponseEntity<>(problemDTO, HttpStatus.CREATED);

        } catch (Exception e) {
            log.error("Failed to create problem with test cases", e);
            throw new RuntimeException("Failed to create problem: " + e.getMessage(), e);
        }
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ProblemDTO> updateProblem(
            @PathVariable Long id,
            @Valid @RequestBody ProblemDTO problemDTO) {
        log.debug("REST request to update problem with ID: {}", id);
        return ResponseEntity.ok(problemService.updateProblem(id, problemDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteProblem(@PathVariable Long id) {
        log.debug("REST request to delete problem with ID: {}", id);
        problemService.deleteProblem(id);
        return ResponseEntity.noContent().build();
    }

    //Thêm problem vào contest
    @PostMapping("/{problemId}/contests/{contestId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> addProblemToContest(
            @PathVariable Long problemId,
            @PathVariable Long contestId) {
        log.debug("REST request to add problem {} to contest {}", problemId, contestId);
        problemService.addProblemToContest(problemId, contestId);
        return ResponseEntity.ok().build();
    }

    //Xóa problem khỏi contest
    @DeleteMapping("/{problemId}/contests/{contestId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> removeProblemFromContest(
            @PathVariable Long problemId,
            @PathVariable Long contestId) {
        log.debug("REST request to remove problem {} from contest {}", problemId, contestId);
        problemService.removeProblemFromContest(problemId, contestId);
        return ResponseEntity.ok().build();
    }
}