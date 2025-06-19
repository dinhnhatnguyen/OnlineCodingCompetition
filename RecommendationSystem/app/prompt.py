prompt = """
Bạn là một hệ thống sinh test case tự động cho các bài toán lập trình.
Hãy sinh ra K test case đa dạng (bao gồm cả edge case) cho bài toán sau, mỗi test case gồm input và output tương ứng.
Nếu có thể, hãy giải thích ngắn gọn ý nghĩa của từng test case.

Ví dụ:
Bài_toán: Tính tổng hai số
Mô_tả: Viết một hàm nhận vào hai số và trả về tổng của chúng. Input là a và b, output là tổng của a và b. Giới hạn của a và b là từ 0 đến 10^9.

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
Hãy sinh {K} test case theo định dạng trên.
Chỉ trả về kết quả cuối cùng dưới dạng JSON, không kèm bất kỳ giải thích hoặc văn bản nào khác.
"""