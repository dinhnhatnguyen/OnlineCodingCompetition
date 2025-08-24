import React from "react";
import { useUITranslation } from "../../contexts/UITranslationContext";

const ProblemSection = () => {
  const { t } = useUITranslation();

  return (
    <section className="bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto flex items-start">
        <div className="w-1/2 pr-8">
          <h2 className="text-2xl font-bold mb-4">
            {t('SECTION_INTERVIEW_PREP_TITLE')}
          </h2>
          <p className="mb-4">
            {t('SECTION_INTERVIEW_PREP_DESC')}
          </p>
          <ul className="list-disc pl-5 mb-4 text-gray-400">
            <li>{t('FEATURE_500_PROBLEMS')}</li>
            <li>{t('FEATURE_MULTI_LANGUAGE')}</li>
            <li>{t('FEATURE_DETAILED_SOLUTIONS')}</li>
          </ul>
          <a
            href="/problems"
            className="primary-btn text-white px-6 py-2 rounded-full hover:bg-pink-600"
          >
            {t('BTN_VIEW_ALL_PROBLEMS')}
          </a>
        </div>
        <div className="w-1/2 bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-400 mb-2">
            {t('SAMPLE_PROBLEM_LABEL')}
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
