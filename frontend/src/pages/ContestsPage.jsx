import React from "react";
import { Helmet } from "react-helmet";
import ContestsList from "../components/contest/ContestsList";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

export default function ContestsPage() {
  return (
    <div className="bg-black min-h-screen w-full flex flex-col justify-between">
      <Helmet>
        <title>Cuộc thi - OCCS</title>
        <meta
          name="description"
          content="Tham gia các cuộc thi lập trình để kiểm tra kỹ năng và cạnh tranh với các lập trình viên khác. Tham gia cuộc thi sắp tới hoặc xem kết quả cuộc thi đã qua."
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
