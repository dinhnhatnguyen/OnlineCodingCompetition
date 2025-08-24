package oj.onlineCodingCompetition.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import oj.onlineCodingCompetition.dto.ContestDTO;
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
import oj.onlineCodingCompetition.dto.ProblemTranslationDTO;
import oj.onlineCodingCompetition.entity.Problem;
import oj.onlineCodingCompetition.entity.ProblemTranslation;
import oj.onlineCodingCompetition.entity.TestCase;
import oj.onlineCodingCompetition.security.entity.User;
import oj.onlineCodingCompetition.security.repository.UserRepository;
import oj.onlineCodingCompetition.service.ProblemService;
import oj.onlineCodingCompetition.service.TranslationService;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Controller class for managing programming problems
 * Lớp controller để quản lý các bài toán lập trình
 *
 * This controller handles all problem-related operations including:
 * Controller này xử lý tất cả các hoạt động liên quan đến bài toán bao gồm:
 * - Problem CRUD operations (Các thao tác CRUD cho bài toán)
 * - Test case management (Quản lý test case)
 * - Problem search and filtering (Tìm kiếm và lọc bài toán)
 * - Contest problem management (Quản lý bài toán trong cuộc thi)
 */
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
    private final TranslationService translationService;

    /**
     * Retrieves all problems
     * Lấy tất cả các bài toán
     *
     * @return List of all problems (Danh sách tất cả các bài toán)
     */
    @GetMapping
    public ResponseEntity<List<ProblemDTO>> getAllProblems(
            @RequestParam(defaultValue = "en") String language) {
        log.debug("REST request to get all problems in language: {}", language);

        List<ProblemDTO> problems = problemService.getAllProblems();

        // If requesting English, return original
        if ("en".equalsIgnoreCase(language)) {
            return ResponseEntity.ok(problems);
        }

        // Apply translations to all problems
        problems.forEach(problemDTO -> {
            try {
                Optional<ProblemTranslation> translationOpt =
                    translationService.getOrCreateTranslation(problemDTO.getId(), language);

                if (translationOpt.isPresent()) {
                    ProblemTranslation translation = translationOpt.get();
                    problemDTO.setTitle(translation.getTitle());
                    problemDTO.setDescription(translation.getDescription());
                    problemDTO.setConstraints(translation.getConstraints());
                }
            } catch (Exception e) {
                log.warn("Failed to get translation for problem {} in language {}: {}",
                    problemDTO.getId(), language, e.getMessage());
                // Keep original content if translation fails
            }
        });

        return ResponseEntity.ok(problems);
    }

    /**
     * Retrieves paginated list of problems
     * Lấy danh sách bài toán theo trang
     *
     * @param pageable Pagination information (Thông tin phân trang)
     * @return Page of problems (Trang chứa danh sách bài toán)
     */
    @GetMapping("/page")
    public ResponseEntity<Page<ProblemDTO>> getProblemsPage(Pageable pageable) {
        log.debug("REST request to get a page of problems");
        return ResponseEntity.ok(problemService.getProblemsPage(pageable));
    }

    /**
     * Retrieves a specific problem by its ID
     * Lấy thông tin bài toán theo ID
     *
     * @param id Problem ID (ID của bài toán)
     * @return Problem information (Thông tin bài toán)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProblemDTO> getProblemById(@PathVariable Long id) {
        log.debug("REST request to get problem by ID: {}", id);
        return ResponseEntity.ok(problemService.getProblemById(id));
    }

    /**
     * Retrieves a specific problem by its ID with translation support
     * Lấy thông tin bài toán theo ID với hỗ trợ dịch thuật
     *
     * @param id Problem ID (ID của bài toán)
     * @param language Target language (Ngôn ngữ đích) - default: "en"
     * @return Problem information in specified language (Thông tin bài toán theo ngôn ngữ chỉ định)
     */
    @GetMapping("/{id}/translate")
    public ResponseEntity<ProblemDTO> getProblemByIdWithTranslation(
            @PathVariable Long id,
            @RequestParam(defaultValue = "en") String language) {
        log.debug("REST request to get problem by ID: {} in language: {}", id, language);

        // Get original problem
        ProblemDTO problemDTO = problemService.getProblemById(id);

        // If requesting English or translation service fails, return original
        if ("en".equalsIgnoreCase(language)) {
            return ResponseEntity.ok(problemDTO);
        }

        try {
            // Get or create translation
            Optional<ProblemTranslation> translationOpt = translationService.getOrCreateTranslation(id, language);

            if (translationOpt.isPresent()) {
                ProblemTranslation translation = translationOpt.get();
                // Apply translation to DTO
                problemDTO.setTitle(translation.getTitle());
                problemDTO.setDescription(translation.getDescription());
                problemDTO.setConstraints(translation.getConstraints());

                log.debug("Successfully applied translation for problem {} in language {}", id, language);
            } else {
                log.warn("Translation not available for problem {} in language {}, returning original", id, language);
            }
        } catch (Exception e) {
            log.error("Error getting translation for problem {} in language {}: {}", id, language, e.getMessage());
            // Return original problem if translation fails
        }

        return ResponseEntity.ok(problemDTO);
    }

    /**
     * Retrieves problems by difficulty level
     * Lấy danh sách bài toán theo mức độ khó
     *
     * @param difficulty Difficulty level (Mức độ khó)
     * @return List of problems with specified difficulty (Danh sách bài toán theo mức độ khó)
     */
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<ProblemDTO>> getProblemsByDifficulty(@PathVariable String difficulty) {
        log.debug("REST request to get problems by difficulty: {}", difficulty);
        return ResponseEntity.ok(problemService.getProblemsByDifficulty(difficulty));
    }

    /**
     * Retrieves problems by topic
     * Lấy danh sách bài toán theo chủ đề
     *
     * @param topic Topic name (Tên chủ đề)
     * @return List of problems with specified topic (Danh sách bài toán theo chủ đề)
     */
    @GetMapping("/topic/{topic}")
    public ResponseEntity<List<ProblemDTO>> getProblemsByTopic(@PathVariable String topic) {
        log.debug("REST request to get problems by topic: {}", topic);
        return ResponseEntity.ok(problemService.getProblemsByTopic(topic));
    }

    /**
     * Retrieves all available topics
     * Lấy tất cả các chủ đề có sẵn
     *
     * @return List of all topics (Danh sách tất cả các chủ đề)
     */
    @GetMapping("/topics")
    public ResponseEntity<List<String>> getAllTopics() {
        log.debug("REST request to get all topics");
        return ResponseEntity.ok(problemService.getAllTopics());
    }

    /**
     * Searches problems by title keyword
     * Tìm kiếm bài toán theo từ khóa trong tiêu đề
     *
     * @param keyword Search keyword (Từ khóa tìm kiếm)
     * @return List of matching problems (Danh sách bài toán phù hợp)
     */
    @GetMapping("/search")
    public ResponseEntity<List<ProblemDTO>> searchProblemsByTitle(@RequestParam String keyword) {
        log.debug("REST request to search problems by title keyword: {}", keyword);
        return ResponseEntity.ok(problemService.searchProblemsByTitle(keyword));
    }

    /**
     * Retrieves problems created by the current user (Admin/Instructor only)
     * Lấy danh sách bài toán do người dùng hiện tại tạo (Chỉ dành cho Admin/Giảng viên)
     *
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return List of problems created by the user (Danh sách bài toán do người dùng tạo)
     */
    @GetMapping("/my-problems")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<ProblemDTO>> getMyProblems(@AuthenticationPrincipal UserDetails userDetails) {
        log.debug("REST request to get problems created by current user");
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(problemService.getProblemsByCreatedBy(user.getId()));
    }

    /**
     * Retrieves a problem with its test cases
     * Lấy thông tin bài toán kèm theo các test case
     *
     * @param id Problem ID (ID của bài toán)
     * @return Problem information with test cases (Thông tin bài toán kèm test case)
     */
    @GetMapping("/{id}/with-test-cases")
    public ResponseEntity<ProblemDTO> getProblemWithTestCases(@PathVariable Long id) {
        log.debug("REST request to get problem with test cases by ID: {}", id);
        return ResponseEntity.ok(problemService.getProblemWithTestCases(id));
    }

    /**
     * Creates a new problem (Admin/Instructor only)
     * Tạo một bài toán mới (Chỉ dành cho Admin/Giảng viên)
     *
     * @param problemDTO Problem data (Dữ liệu bài toán)
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return Created problem information (Thông tin bài toán đã tạo)
     */
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

    /**
     * Creates a new problem with test cases (Admin/Instructor only)
     * Tạo một bài toán mới kèm theo test case (Chỉ dành cho Admin/Giảng viên)
     *
     * @param requestBody Request containing problem and test case data (Yêu cầu chứa dữ liệu bài toán và test case)
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return Created problem information (Thông tin bài toán đã tạo)
     */
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
                    try {
                        Map<String, Object> signatureData = objectMapper.readValue(jsonString, Map.class);
                        String functionName = (String) signatureData.get("functionName");
                        List<String> parameterTypes = (List<String>) signatureData.get("parameterTypes");
                        String returnType = (String) signatureData.get("returnType");
                        Problem.FunctionSignature signature = new Problem.FunctionSignature(functionName, parameterTypes, returnType);
                        functionSignatures.put(language, signature);
                    } catch (Exception e) {
                        log.error("Error parsing function signature for language {}: {}", language, e.getMessage());
                        throw new RuntimeException("Invalid function signature format for " + language);
                    }
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

    /**
     * Updates an existing problem (Admin/Instructor only)
     * Cập nhật một bài toán đã tồn tại (Chỉ dành cho Admin/Giảng viên)
     *
     * @param id Problem ID (ID của bài toán)
     * @param problemDTO Updated problem data (Dữ liệu bài toán cập nhật)
     * @return Updated problem information (Thông tin bài toán đã cập nhật)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<ProblemDTO> updateProblem(
            @PathVariable Long id,
            @Valid @RequestBody ProblemDTO problemDTO) {
        log.debug("REST request to update problem with ID: {}", id);
        return ResponseEntity.ok(problemService.updateProblem(id, problemDTO));
    }

    /**
     * Gets all contests that contain a specific problem
     * Lấy tất cả cuộc thi chứa bài toán cụ thể
     *
     * @param id Problem ID (ID của bài toán)
     * @return List of contests containing the problem (Danh sách cuộc thi chứa bài toán)
     */
    @GetMapping("/{id}/contests")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<List<ContestDTO>> getContestsContainingProblem(@PathVariable Long id) {
        log.debug("REST request to get contests containing problem with ID: {}", id);
        try {
            List<ContestDTO> contests = problemService.getContestsContainingProblem(id);
            return ResponseEntity.ok(contests);
        } catch (EntityNotFoundException e) {
            log.error("Problem not found with ID: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting contests for problem with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deletes a problem (Admin/Instructor only)
     * Xóa một bài toán (Chỉ dành cho Admin/Giảng viên)
     *
     * @param id Problem ID (ID của bài toán)
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return Empty response with OK status (Phản hồi trống với trạng thái OK)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> deleteProblem(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.debug("REST request to delete Problem : {}", id);
        try {
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            problemService.deleteProblem(id, user.getId());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting problem with id: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Adds a problem to a contest (Admin/Instructor only)
     * Thêm một bài toán vào cuộc thi (Chỉ dành cho Admin/Giảng viên)
     *
     * @param problemId Problem ID (ID của bài toán)
     * @param contestId Contest ID (ID của cuộc thi)
     * @return Empty response with OK status (Phản hồi trống với trạng thái OK)
     */
    @PostMapping("/{problemId}/contests/{contestId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> addProblemToContest(
            @PathVariable Long problemId,
            @PathVariable Long contestId) {
        log.debug("REST request to add problem {} to contest {}", problemId, contestId);
        problemService.addProblemToContest(problemId, contestId);
        return ResponseEntity.ok().build();
    }

    /**
     * Removes a problem from a contest (Admin/Instructor only)
     * Xóa một bài toán khỏi cuộc thi (Chỉ dành cho Admin/Giảng viên)
     *
     * @param problemId Problem ID (ID của bài toán)
     * @param contestId Contest ID (ID của cuộc thi)
     * @return Empty response with OK status (Phản hồi trống với trạng thái OK)
     */
    @DeleteMapping("/{problemId}/contests/{contestId}")
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<Void> removeProblemFromContest(
            @PathVariable Long problemId,
            @PathVariable Long contestId) {
        log.debug("REST request to remove problem {} from contest {}", problemId, contestId);
        problemService.removeProblemFromContest(problemId, contestId);
        return ResponseEntity.ok().build();
    }

    /**
     * Updates a problem with its test cases (Admin/Instructor only)
     * Cập nhật một bài toán kèm theo test case (Chỉ dành cho Admin/Giảng viên)
     *
     * @param id Problem ID (ID của bài toán)
     * @param requestBody Request containing updated problem and test case data (Yêu cầu chứa dữ liệu bài toán và test case cập nhật)
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return Updated problem information (Thông tin bài toán đã cập nhật)
     */
    @PutMapping("/{id}/with-test-cases")
    public ResponseEntity<?> updateProblemWithTestCases(
            @PathVariable Long id,
            @RequestBody Map<String, Object> requestBody,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("Updating problem with test cases. ID: {}", id);

        try {
            User user = userRepository.findByUsername(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Problem problem = problemService.getProblemEntityById(id);
            
            // Verify ownership or admin role
            if (!problem.getCreatedBy().getId().equals(user.getId()) && 
                    !userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> problemData = (Map<String, Object>) requestBody.get("createProblem");

            // Update basic problem data
            if (problemData.get("title") != null) problem.setTitle((String) problemData.get("title"));
            if (problemData.get("description") != null) problem.setDescription((String) problemData.get("description"));
            if (problemData.get("difficulty") != null) problem.setDifficulty((String) problemData.get("difficulty"));
            if (problemData.get("constraints") != null) problem.setConstraints((String) problemData.get("constraints"));

            if (problemData.get("contestId") != null) {
                Long contestId = ((Number) problemData.get("contestId")).longValue();
                problem.setContestId(contestId);
            }

            // Update topics
            @SuppressWarnings("unchecked")
            List<String> topics = (List<String>) problemData.get("topics");
            if (topics != null) {
                problem.setTopics(new java.util.HashSet<>(topics));
            }

            // Update supported languages
            @SuppressWarnings("unchecked")
            Map<String, Boolean> supportedLanguages = (Map<String, Boolean>) problemData.get("supportedLanguages");
            if (supportedLanguages != null) {
                problem.setSupportedLanguages(supportedLanguages);
            }

            // Update function signatures
            @SuppressWarnings("unchecked")
            Map<String, String> functionSignaturesMap = (Map<String, String>) problemData.get("functionSignatures");
            if (functionSignaturesMap != null) {
                Map<String, Problem.FunctionSignature> functionSignatures = new HashMap<>();
                
                for (Map.Entry<String, String> entry : functionSignaturesMap.entrySet()) {
                    String language = entry.getKey();
                    String jsonString = entry.getValue();
                    try {
                        Map<String, Object> signatureData = objectMapper.readValue(jsonString, Map.class);
                        String functionName = (String) signatureData.get("functionName");
                        List<String> parameterTypes = (List<String>) signatureData.get("parameterTypes");
                        String returnType = (String) signatureData.get("returnType");
                        Problem.FunctionSignature signature = new Problem.FunctionSignature(functionName, parameterTypes, returnType);
                        functionSignatures.put(language, signature);
                    } catch (Exception e) {
                        log.error("Error parsing function signature for language {}: {}", language, e.getMessage());
                        throw new RuntimeException("Invalid function signature format for " + language);
                    }
                }
                
                problem.setFunctionSignatures(functionSignatures);
            }

            // Keep existing test cases unchanged
            // Test cases will not be modified in this endpoint anymore

            Problem updatedProblem = problemService.updateProblemWithTestCases(problem);
            return ResponseEntity.ok(problemService.convertToDTO(updatedProblem));

        } catch (Exception e) {
            log.error("Error updating problem with test cases: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    // ==================== TRANSLATION MANAGEMENT ENDPOINTS ====================

    /**
     * Get available translation languages
     * Lấy danh sách ngôn ngữ dịch có sẵn
     */
    @GetMapping("/translations/languages")
    public ResponseEntity<List<String>> getAvailableLanguages() {
        log.debug("REST request to get available translation languages");
        List<String> languages = translationService.getAvailableLanguages();
        // Always include English as base language
        if (!languages.contains("en")) {
            languages.add(0, "en");
        }
        return ResponseEntity.ok(languages);
    }

    /**
     * Get translation for a specific problem and language
     * Lấy bản dịch cho bài toán và ngôn ngữ cụ thể
     */
    @GetMapping("/{id}/translations/{language}")
    public ResponseEntity<ProblemTranslationDTO> getTranslation(
            @PathVariable Long id,
            @PathVariable String language) {
        log.debug("REST request to get translation for problem {} in language {}", id, language);

        Optional<ProblemTranslation> translationOpt = translationService.getTranslation(id, language);
        if (translationOpt.isPresent()) {
            ProblemTranslation translation = translationOpt.get();
            ProblemTranslationDTO dto = new ProblemTranslationDTO();
            dto.setId(translation.getId());
            dto.setProblemId(translation.getProblem().getId());
            dto.setLanguage(translation.getLanguage());
            dto.setTitle(translation.getTitle());
            dto.setDescription(translation.getDescription());
            dto.setConstraints(translation.getConstraints());
            dto.setCreatedAt(translation.getCreatedAt());
            dto.setUpdatedAt(translation.getUpdatedAt());

            return ResponseEntity.ok(dto);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Force create/update translation for a problem (Admin only)
     * Tạo/cập nhật bản dịch cho bài toán (Chỉ dành cho Admin)
     */
    @PostMapping("/{id}/translations/{language}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProblemTranslationDTO> createOrUpdateTranslation(
            @PathVariable Long id,
            @PathVariable String language) {
        log.debug("REST request to create/update translation for problem {} in language {}", id, language);

        try {
            Optional<ProblemTranslation> translationOpt = translationService.getOrCreateTranslation(id, language);
            if (translationOpt.isPresent()) {
                ProblemTranslation translation = translationOpt.get();
                ProblemTranslationDTO dto = new ProblemTranslationDTO();
                dto.setId(translation.getId());
                dto.setProblemId(translation.getProblem().getId());
                dto.setLanguage(translation.getLanguage());
                dto.setTitle(translation.getTitle());
                dto.setDescription(translation.getDescription());
                dto.setConstraints(translation.getConstraints());
                dto.setCreatedAt(translation.getCreatedAt());
                dto.setUpdatedAt(translation.getUpdatedAt());

                return ResponseEntity.ok(dto);
            } else {
                return ResponseEntity.badRequest().build();
            }
        } catch (Exception e) {
            log.error("Error creating translation for problem {} in language {}: {}", id, language, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete translation for a problem (Admin only)
     * Xóa bản dịch cho bài toán (Chỉ dành cho Admin)
     */
    @DeleteMapping("/{id}/translations/{language}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTranslation(
            @PathVariable Long id,
            @PathVariable String language) {
        log.debug("REST request to delete translation for problem {} in language {}", id, language);

        try {
            translationService.deleteTranslation(id, language);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error deleting translation for problem {} in language {}: {}", id, language, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Batch translate problems to a specific language (Admin only)
     * Dịch hàng loạt bài toán sang ngôn ngữ cụ thể (Chỉ dành cho Admin)
     */
    @PostMapping("/translations/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> batchTranslateProblems(
            @RequestParam String language,
            @RequestParam(required = false) List<Long> problemIds) {
        log.debug("REST request to batch translate problems to language: {}", language);

        try {
            List<Long> targetProblemIds = problemIds;
            if (targetProblemIds == null || targetProblemIds.isEmpty()) {
                // Get all problem IDs if none specified
                targetProblemIds = problemService.getAllProblems().stream()
                    .map(ProblemDTO::getId)
                    .collect(Collectors.toList());
            }

            translationService.batchTranslateProblems(language, targetProblemIds);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Batch translation completed");
            response.put("language", language);
            response.put("problemCount", targetProblemIds.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in batch translation to language {}: {}", language, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}