import React from "react";
import HeroSection from "../components/home/HeroSection";
import FeatureCard from "../components/home/FeatureCard";
import ProblemSection from "../components/home/ProblemSection";
import CallToAction from "../components/home/CallToAction";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";

const Home = () => {
  const features = [
    {
      icon: "lightbulb",
      title: "Curated Problems",
      description:
        "Practice with a diverse collection of algorithm problems, ranging from easy to hard difficulty.",
    },
    {
      icon: "clock",
      title: "Weekly Contests",
      description:
        "Test your skills in weekly coding contests and compete with other developers globally.",
    },
    {
      icon: "check",
      title: "Real-time Feedback",
      description:
        "Get immediate feedback on your solutions with detailed test cases and performance metrics.",
    },
  ];

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <Header icon={"../assets/OCCS.png"} />
      <HeroSection />
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </section>
      <ProblemSection />
      <CallToAction />
      <Footer />
    </div>
  );
};

export default Home;
