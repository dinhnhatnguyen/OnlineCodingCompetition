import React from "react";

const CallToAction = () => {
  return (
    <section className="bg-gray-900 text-white text-center py-12 px-4 rounded-lg mx-4 mt-8">
      <h2 className="text-2xl font-bold mb-4">
        Sẵn sàng nâng cao kỹ năng lập trình của bạn?
      </h2>
      <p className="mb-6 text-gray-400">
        Tham gia cùng hàng nghìn lập trình viên đang cải thiện khả năng giải
        quyết vấn đề và chuẩn bị cho các cuộc phỏng vấn kỹ thuật.
      </p>
      <a href="/problems" className="primary-btn px-6 py-3">
        Bắt đầu lập trình ngay
      </a>
    </section>
  );
};

export default CallToAction;
