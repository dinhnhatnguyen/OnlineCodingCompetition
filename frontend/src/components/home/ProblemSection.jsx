import React from "react";

const ProblemSection = () => {
  return (
    <section className="bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto flex items-start">
        <div className="w-1/2 pr-8">
          <h2 className="text-2xl font-bold mb-4">
            Chuẩn bị cho các cuộc phỏng vấn kỹ thuật
          </h2>
          <p className="mb-4">
            Nền tảng của chúng tôi được thiết kế để giúp bạn thành công trong
            các cuộc phỏng vấn kỹ thuật tại các công ty công nghệ hàng đầu. Với
            các bài toán tương tự như những câu hỏi trong phỏng vấn thực tế, bạn
            sẽ được chuẩn bị tốt để thể hiện kỹ năng thuật toán của mình.
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-400">
            <li>Hơn 500 bài toán thuật toán trên nhiều danh mục</li>
            <li>Hỗ trợ nhiều ngôn ngữ lập trình</li>
            <li>Giải thích chi tiết và giải pháp tối ưu</li>
          </ul>
          <a
            href="/problems"
            className="primary-btn text-white px-6 py-2 rounded-full hover:bg-pink-600"
          >
            Xem tất cả bài tập
          </a>
        </div>
        <div className="w-1/2 bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 mb-2">
            Bài tập mẫu: Two Sum (Tổng hai số)
          </p>
          <pre className="text-sm bg-gray-900 p-4 rounded">
            {`function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return null;
}`}
          </pre>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
