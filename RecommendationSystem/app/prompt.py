prompt = """
Bạn là một hệ thống sinh test case tự động cho các bài toán lập trình.
Hãy sinh ra K test case đa dạng (bao gồm cả edge case) cho bài toán sau, mỗi test case gồm input và output tương ứng.

QUAN TRỌNG - FORMAT INPUT:
- Nếu có function signature, input phải là array với số phần tử = số parameters
- Mỗi phần tử trong input array tương ứng với 1 parameter
- Ví dụ: function sum(int a, int b) → input: [7, 3] (2 phần tử riêng biệt)
- KHÔNG nối các parameters thành string

Ví dụ với function signature:
Function: sum(int a, int b) -> int
Bài_toán: Tính tổng hai số
Mô_tả: Viết một hàm nhận vào hai số và trả về tổng của chúng.

Kết quả mong muốn (dưới dạng JSON):
[
    {{"input": [3, 5], "output": 8, "description": "Tổng hai số nguyên dương."}},
    {{"input": [0, 0], "output": 0, "description": "Cả hai số là 0."}},
    {{"input": [-1000, 20000], "output": 19000, "description": "Một số âm, một số dương."}},
    {{"input": [1000000000, 1000000000], "output": 2000000000, "description": "Cả hai số đạt giá trị lớn nhất."}},
    {{"input": [1, 999999999], "output": 1000000000, "description": "Một số nhỏ nhất, một số lớn nhất."}},
    {{"input": [-500, -500], "output": -1000, "description": "Cả hai số đều âm."}}
]

Bài toán: {problem}
{function_info}
Hãy sinh {K} test case theo định dạng trên.
Chỉ trả về kết quả cuối cùng dưới dạng JSON, không kèm bất kỳ giải thích hoặc văn bản nào khác.
"""