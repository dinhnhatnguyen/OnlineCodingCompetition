import React from "react";

const HeroSection = () => {
  return (
    <section className="bg-black text-white text-center py-20 px-4">
      <h1 className="text-5xl font-bold mb-4">
        Master Algorithms, Ace Your Coding Interviews
      </h1>
      <p className="text-lg mb-6">
        Enhance your problem-solving skills with our collection of algorithm
        challenges. Practice, compete, and learn with AlgoPractice.
      </p>
      <div className="space-x-4">
        <a href="/problems" className="primary-btn px-6 py-3">
          Start Practicing
        </a>
        <a href="/contests" className="text-white hover:text-primary-pink">
          View Contests
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
