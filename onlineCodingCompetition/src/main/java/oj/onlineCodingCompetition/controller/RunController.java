package oj.onlineCodingCompetition.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import oj.onlineCodingCompetition.dto.RunCodeDTO;
import oj.onlineCodingCompetition.dto.RunCodeResultDTO;
import oj.onlineCodingCompetition.service.RunService;
import oj.onlineCodingCompetition.service.RunService.ScratchCodeDTO;
import oj.onlineCodingCompetition.service.RunService.ScratchResultDTO;

/**
 * Controller class for managing code execution
 * Lớp controller để quản lý việc thực thi mã nguồn
 *
 * This controller handles all code execution operations including:
 * Controller này xử lý tất cả các hoạt động thực thi mã nguồn bao gồm:
 * - Running code against test cases (Chạy mã nguồn với các test case)
 * - Running scratch/practice code (Chạy mã nguồn thử nghiệm/luyện tập)
 */
@RestController
@RequestMapping("/api/run")
@RequiredArgsConstructor
@Tag(name = "Run Code", description = "API để chạy thử code với các test case")
public class RunController {

    private final RunService runService;

    /**
     * Runs code against specified test cases
     * Chạy mã nguồn với các test case được chỉ định
     *
     * @param runCodeDTO Code execution data including source code and test cases (Dữ liệu thực thi bao gồm mã nguồn và test case)
     * @param userDetails Current user details (Thông tin người dùng hiện tại)
     * @return Execution results including test case outcomes (Kết quả thực thi bao gồm kết quả các test case)
     */
    @PostMapping
    public ResponseEntity<RunCodeResultDTO> runCode(
            @Valid @RequestBody RunCodeDTO runCodeDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(runService.runCode(runCodeDTO));
    }

    /**
     * Runs scratch/practice code with custom input
     * Chạy mã nguồn thử nghiệm/luyện tập với đầu vào tùy chỉnh
     *
     * @param scratchCodeDTO Code execution data including source code and custom input (Dữ liệu thực thi bao gồm mã nguồn và đầu vào tùy chỉnh)
     * @return Execution results (Kết quả thực thi)
     */
    @PostMapping("/scratch")
    public ResponseEntity<ScratchResultDTO> runScratchCode(@RequestBody ScratchCodeDTO scratchCodeDTO) {
        ScratchResultDTO result = runService.runScratchCode(scratchCodeDTO);
        return ResponseEntity.ok(result);
    }
} 