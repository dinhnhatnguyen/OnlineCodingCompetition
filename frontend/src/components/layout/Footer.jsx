import React from "react";
import { FaGithub, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white text-center py-6 px-4">
      <div className="mb-4">
        <p className="text-pink-500 font-semibold">OCCS</p>
        <p className="text-gray-400">Làm chủ thuật toán, từng bài tập một.</p>
      </div>
      <div className="flex justify-center space-x-4 mb-4">
        <a href="#" className="text-gray-400 hover:text-pink-500">
          <FaGithub />
        </a>
        <a href="#" className="text-gray-400 hover:text-pink-500">
          <FaTwitter />
        </a>
      </div>
      <p className="text-gray-400">© 2025 OCCS. Đã đăng ký bản quyền.</p>
      <div className="mt-2 text-gray-400 space-x-4">
        <a href="#" className="hover:text-pink-500">
          Chính sách bảo mật
        </a>
        <a href="#" className="hover:text-pink-500">
          Điều khoản dịch vụ
        </a>
        <a href="#" className="hover:text-pink-500">
          Liên hệ
        </a>
      </div>
    </footer>
  );
};

export default Footer;
