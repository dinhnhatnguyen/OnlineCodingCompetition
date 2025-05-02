package oj.onlineCodingCompetition.controller;

import oj.onlineCodingCompetition.dto.request.CodeExecutionRequest;
import oj.onlineCodingCompetition.dto.response.CodeExecutionResponse;
import oj.onlineCodingCompetition.service.RunCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/code")
public class CodeExecutionController {

    private final RunCodeService runCodeService;

    @Autowired
    public CodeExecutionController(RunCodeService runCodeService) {
        this.runCodeService = runCodeService;
    }

    @PostMapping("/execute")
    public ResponseEntity<CodeExecutionResponse> executeCode(@RequestBody CodeExecutionRequest request) {
        try {
            Map<String, Object> result = runCodeService.executeCode(request.getCode(), request.getLanguage());

            CodeExecutionResponse response = new CodeExecutionResponse();
            response.setStatus((String) result.get("status"));
            response.setOutput((String) result.get("output"));
            if (result.containsKey("exitCode")) {
                response.setExitCode((Integer) result.get("exitCode"));
            }

            return ResponseEntity.ok(response);
        } catch (IOException | InterruptedException e) {
            CodeExecutionResponse response = new CodeExecutionResponse();
            response.setStatus("SYSTEM_ERROR");
            response.setOutput("Error executing code: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        } catch (IllegalArgumentException e) {
            CodeExecutionResponse response = new CodeExecutionResponse();
            response.setStatus("BAD_REQUEST");
            response.setOutput(e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
