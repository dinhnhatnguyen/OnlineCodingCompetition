package oj.onlineCodingCompetition.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "test_cases")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(name = "input_data", columnDefinition = "JSONB")
    @Type(JsonBinaryType.class)
    private String inputData; // JSON chứa danh sách input (ví dụ: [{"input": "abc", "dataType": "String"}])

    @Column(name = "expected_output_data", columnDefinition = "JSONB")
    @Type(JsonBinaryType.class)
    private String expectedOutputData; // JSON chứa expected output (ví dụ: {"expectedOutput": "6", "dataType": "integer"})

    @Column(name = "input_type")
    private String inputType;

    @Column(name = "output_type")
    private String outputType;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "depends_on")
    private Long dependsOn;

    @Column(name = "is_example")
    private Boolean isExample;

    @Column(name = "is_hidden")
    private Boolean isHidden;

    @Column(name = "time_limit")
    private Integer timeLimit; // Giới hạn thời gian (ms)

    @Column(name = "memory_limit")
    private Integer memoryLimit; // Giới hạn bộ nhớ (KB)

    @Column(name = "weight")
    private Double weight; // Điểm số của test case

    @Column(name = "test_order")
    private Integer testOrder;

    @Column(name = "comparison_mode")
    private String comparisonMode; // Ví dụ: EXACT, FLOAT, IGNORE_WHITESPACE

    @Column(name = "epsilon")
    private Double epsilon; // Dùng cho so sánh FLOAT


}