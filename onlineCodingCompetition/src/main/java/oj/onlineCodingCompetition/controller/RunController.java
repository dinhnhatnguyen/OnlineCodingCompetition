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

@RestController
@RequestMapping("/api/run")
@RequiredArgsConstructor
@Tag(name = "Run Code", description = "API để chạy thử code với các test case")
public class RunController {

    private final RunService runService;

    @PostMapping
    public ResponseEntity<RunCodeResultDTO> runCode(
            @Valid @RequestBody RunCodeDTO runCodeDTO,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(runService.runCode(runCodeDTO));
    }
} 