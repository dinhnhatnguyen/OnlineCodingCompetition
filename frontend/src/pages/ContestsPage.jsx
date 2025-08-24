import React from "react";
import { Helmet } from "react-helmet";
import { useUITranslation } from "../contexts/UITranslationContext";
import ContestsList from "../components/contest/ContestsList";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function ContestsPage() {
  const { t } = useUITranslation();

  return (
    <div className="bg-black min-h-screen w-full flex flex-col justify-between">
      <Helmet>
        <title>{t('NAV_CONTESTS')} - OCCS</title>
        <meta
          name="description"
          content={t('DISCOVER_CONTESTS')}
        />
      </Helmet>
      <Header />
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-2 md:px-6 py-8">
          <ContestsList />
        </section>
      </main>
      <Footer />
    </div>
  );
}
