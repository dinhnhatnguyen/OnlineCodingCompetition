import React, { useState } from "react";
import { useUITranslation } from "../../contexts/UITranslationContext";
import { ChevronDown } from "lucide-react";

const UILanguageSwitcher = () => {
  const { currentLanguage, changeLanguage, loading } = useUITranslation();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  ];

  const current = languages.find((lang) => lang.code === currentLanguage);

  const handleChange = (code) => {
    changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white 
                   border border-gray-600 rounded-xl shadow-sm 
                   hover:border-blue-400 hover:shadow-md
                   focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      >
        <span className="text-lg">{current?.flag}</span>
        <span className="text-sm">{current?.name}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute mt-2 w-40 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-10">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleChange(lang.code)}
              className="flex items-center gap-2 w-full px-3 py-2 text-left 
                         text-white hover:bg-gray-700 rounded-lg transition"
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        </div>
      )}
    </div>
  );
};

export default UILanguageSwitcher;
