package oj.onlineCodingCompetition.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RunCodeDTO {
    private Long problemId;
    private String language;
    private String sourceCode;
    private List<Long> testCaseIds; // Danh sách ID của test case muốn chạy thử (các example test case)
} 