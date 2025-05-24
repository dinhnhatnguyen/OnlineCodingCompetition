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
      title: "Bài tập chọn lọc",
      description:
        "Luyện tập với bộ sưu tập đa dạng các bài toán thuật toán, từ mức độ dễ đến khó.",
    },
    {
      icon: "clock",
      title: "Cuộc thi hàng tuần",
      description:
        "Kiểm tra kỹ năng của bạn trong các cuộc thi lập trình hàng tuần và cạnh tranh với những lập trình viên khác trên toàn cầu.",
    },
    {
      icon: "check",
      title: "Phản hồi thời gian thực",
      description:
        "Nhận phản hồi ngay lập tức về giải pháp của bạn với các test case chi tiết và các chỉ số hiệu suất.",
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
