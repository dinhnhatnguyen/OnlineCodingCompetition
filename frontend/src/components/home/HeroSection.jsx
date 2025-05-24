import React from "react";

const HeroSection = () => {
  return (
    <section className="bg-black text-white text-center py-20 px-4">
      <h1 className="text-5xl font-bold mb-4">
        Làm chủ thuật toán, chinh phục các cuộc phỏng vấn lập trình
      </h1>
      <p className="text-lg mb-6">
        Nâng cao kỹ năng giải quyết vấn đề với bộ sưu tập thử thách thuật toán
        của chúng tôi. Thực hành, thi đấu và học hỏi cùng chúng tôi.
      </p>
      <div className="space-x-4">
        <a href="/problems" className="primary-btn px-6 py-3">
          Bắt đầu luyện tập
        </a>
        <a href="/contests" className="text-white hover:text-primary-pink">
          Xem các cuộc thi
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
