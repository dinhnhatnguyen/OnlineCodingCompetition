import React from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ScratchPad from "../components/ScratchPad";

const ScratchPadPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 text-white">
      <Header />
      <main
        className="flex-grow container mx-auto px-4 py-8"
        style={{ minHeight: "800px" }}
      >
        <ScratchPad />
      </main>
      <Footer />
    </div>
  );
};

export default ScratchPadPage;
