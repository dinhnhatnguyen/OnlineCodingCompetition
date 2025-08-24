import React from "react";
import { useUITranslation } from "../../contexts/UITranslationContext";

const HeroSection = () => {
  const { t } = useUITranslation();

  return (
    <section className="bg-black text-white text-center py-20 px-4">
      <h1 className="text-5xl font-bold mb-4">
        {t('HERO_TITLE')}
      </h1>
      <p className="text-lg mb-6">
        {t('HERO_SUBTITLE')}
      </p>
      <div className="space-x-4">
        <a href="/problems" className="primary-btn px-6 py-3">
          {t('BTN_START_PRACTICE')}
        </a>
        <a href="/contests" className="text-white hover:text-primary-pink">
          {t('BTN_VIEW_CONTESTS')}
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
