import React from "react";
import { Helmet } from "react-helmet";
import ContestsList from "../components/contest/ContestsList";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function ContestsPage() {
  return (
    <div className="bg-black min-h-screen w-full flex flex-col justify-between">
      <Helmet>
        <title>Contests - AlgoPractice</title>
        <meta
          name="description"
          content="Participate in coding contests to test your skills and compete with other developers. Join upcoming contests or view past contests results."
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
