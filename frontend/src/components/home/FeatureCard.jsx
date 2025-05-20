import React from "react";
import { FaLightbulb, FaClock, FaCheckCircle, FaBolt } from "react-icons/fa";

const iconColors = {
  lightbulb: "bg-pink-500", // hồng
  clock: "#7c3aed", // tím
  check: "#22c55e", // xanh lá
};

const FeatureCard = ({ icon, title, description }) => {
  const IconComponent =
    icon === "lightbulb" ? FaLightbulb : icon === "clock" ? FaClock : FaBolt;

  return (
    <div className="bg-gray-900 p-6 rounded-lg text-center">
      <IconComponent
        className="text-3xl mb-4"
        style={{ color: iconColors[icon] || "#fff" }}
      />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default FeatureCard;
