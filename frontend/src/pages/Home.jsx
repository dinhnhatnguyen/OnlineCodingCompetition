import React from "react";
import { useUITranslation } from "../contexts/UITranslationContext";
import HeroSection from "../components/home/HeroSection";
import FeatureCard from "../components/home/FeatureCard";
import ProblemSection from "../components/home/ProblemSection";
import CallToAction from "../components/home/CallToAction";
import Footer from "../components/layout/Footer";
import Header from "../components/layout/Header";

const Home = () => {
  const { t } = useUITranslation();

  const features = [
    {
      icon: "lightbulb",
      title: t('FEATURE_CURATED_PROBLEMS'),
      description: t('FEATURE_CURATED_PROBLEMS_DESC'),
    },
    {
      icon: "clock",
      title: t('FEATURE_WEEKLY_CONTESTS'),
      description: t('FEATURE_WEEKLY_CONTESTS_DESC'),
    },
    {
      icon: "check",
      title: t('FEATURE_REAL_TIME_FEEDBACK'),
      description: t('FEATURE_REAL_TIME_FEEDBACK_DESC'),
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
