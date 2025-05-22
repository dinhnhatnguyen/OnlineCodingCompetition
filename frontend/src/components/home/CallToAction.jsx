import React from "react";

const CallToAction = () => {
  return (
    <section className="bg-gray-900 text-white text-center py-12 px-4 rounded-lg mx-4 mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Ready to elevate your coding skills?
      </h2>
      <p className="mb-6 text-gray-400">
        Join thousands of developers improving their problem-solving abilities
        and preparing for technical interviews.
      </p>
      <a href="/problems" className="primary-btn px-6 py-3">
        Start Coding Now
      </a>
    </section>
  );
};

export default CallToAction;
