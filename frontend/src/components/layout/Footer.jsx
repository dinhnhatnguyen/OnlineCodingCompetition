import React from "react";
import { FaGithub, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-black text-white text-center py-6 px-4">
      <div className="mb-4">
        <p className="text-pink-500 font-semibold">OCCS</p>
        <p className="text-gray-400">
          Master algorithms, one problem at a time.
        </p>
      </div>
      <div className="flex justify-center space-x-4 mb-4">
        <a href="#" className="text-gray-400 hover:text-pink-500">
          <FaGithub />
        </a>
        <a href="#" className="text-gray-400 hover:text-pink-500">
          <FaTwitter />
        </a>
      </div>
      <p className="text-gray-400">© 2025 OCCS. All rights reserved.</p>
      <div className="mt-2 text-gray-400 space-x-4">
        <a href="#" className="hover:text-pink-500">
          Privacy Policy
        </a>
        <a href="#" className="hover:text-pink-500">
          Terms of Service
        </a>
        <a href="#" className="hover:text-pink-500">
          Contact
        </a>
      </div>
    </footer>
  );
};

export default Footer;
