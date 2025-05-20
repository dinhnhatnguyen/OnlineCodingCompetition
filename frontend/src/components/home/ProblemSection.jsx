import React from "react";

const ProblemSection = () => {
  return (
    <section className="bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto flex items-start">
        <div className="w-1/2 pr-8">
          <h2 className="text-2xl font-bold mb-4">
            Prepare for Technical Interviews
          </h2>
          <p className="mb-4">
            Our platform is designed to help you excel in technical interviews
            at top tech companies. With problems similar to those asked in real
            interviews, you'll be well-prepared to showcase your algorithmic
            skills.
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-400">
            <li>Over 500 algorithm problems across multiple categories</li>
            <li>Support for multiple programming languages</li>
            <li>Detailed explanations and optimal solutions</li>
          </ul>
          <a
            href="/problems"
            className="primary-btn text-white px-6 py-2 rounded-full hover:bg-pink-600"
          >
            Browse Problems
          </a>
        </div>
        <div className="w-1/2 bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 mb-2">Example Problem: Two Sum</p>
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
