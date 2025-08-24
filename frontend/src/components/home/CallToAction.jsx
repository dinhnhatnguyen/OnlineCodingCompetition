import React from "react";
import { useUITranslation } from "../../contexts/UITranslationContext";

const CallToAction = () => {
  const { t } = useUITranslation();

  return (
    <section className="bg-gray-900 text-white text-center py-12 px-4 rounded-lg mx-4 mt-8">
      <h2 className="text-2xl font-bold mb-4">
        {t('CTA_TITLE')}
      </h2>
      <p className="mb-6 text-gray-400">
        {t('CTA_SUBTITLE')}
      </p>
      <a href="/problems" className="primary-btn px-6 py-3">
        {t('BTN_START_CODING_NOW')}
      </a>
    </section>
  );
};

export default CallToAction;
