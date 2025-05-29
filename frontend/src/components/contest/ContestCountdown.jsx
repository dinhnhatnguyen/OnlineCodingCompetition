import React, { useState, useEffect } from "react";

const ContestCountdown = ({ startTime, endTime, status }) => {
  const [countdown, setCountdown] = useState("");
  const [timeType, setTimeType] = useState(""); // 'to_start', 'to_end', or ''

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const start = new Date(startTime);
      const end = new Date(endTime);
      let diff;

      if (status === "UPCOMING") {
        diff = start - now;
        setTimeType("to_start");
      } else if (status === "ONGOING") {
        diff = end - now;
        setTimeType("to_end");
      } else {
        setTimeType("");
        setCountdown("");
        return;
      }

      if (diff <= 0) {
        setCountdown("");
        return;
      }

      // Tính toán thời gian
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      // Format countdown string
      let countdownStr = "";
      if (days > 0) countdownStr += `${days}d `;
      if (hours > 0 || days > 0) countdownStr += `${hours}h `;
      if (minutes > 0 || hours > 0 || days > 0) countdownStr += `${minutes}m `;
      countdownStr += `${seconds}s`;

      setCountdown(countdownStr);
    };

    // Cập nhật mỗi giây
    const timer = setInterval(calculateCountdown, 1000);
    calculateCountdown(); // Tính toán lần đầu ngay lập tức

    return () => clearInterval(timer);
  }, [startTime, endTime, status]);

  if (!countdown || !timeType) return null;

  return (
    <div className="text-sm">
      <span className="font-medium">
        {timeType === "to_start" ? "Bắt đầu sau: " : "Kết thúc sau: "}
      </span>
      <span className="text-pink-500 font-bold">{countdown}</span>
    </div>
  );
};

export default ContestCountdown;
