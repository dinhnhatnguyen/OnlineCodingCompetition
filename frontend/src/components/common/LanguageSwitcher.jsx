import React, { useState, useRef, useEffect } from "react";
import { GlobalOutlined } from "@ant-design/icons";
import { useLanguage } from "../../contexts/LanguageContext";

const LanguageSwitcher = ({
  size = "default",
  showIcon = true,
  style = {},
  variant = "default", // 'default', 'navbar', 'compact'
}) => {
  const { currentLanguage, availableLanguages, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = availableLanguages.find(
    (lang) => lang.code === currentLanguage
  );

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Navbar variant - sleek design for header
  if (variant === "navbar") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 text-white transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50"
          aria-label={`Change language. Current: ${currentLang?.name}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="text-lg">{currentLang?.flag}</span>
          <span className="text-sm font-medium hidden sm:block">
            {currentLang?.name}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            className="language-switcher-dropdown absolute right-0 top-full mt-2 w-40 bg-gray-800 border border-gray-600/50 rounded-lg shadow-xl z-50 overflow-hidden"
            role="listbox"
            aria-label="Language options"
          >
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-700/50 transition-colors duration-150 ${
                  currentLanguage === language.code
                    ? "bg-blue-600/20 text-blue-400 border-r-2 border-blue-400"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span className="text-sm font-medium">{language.name}</span>
                {currentLanguage === language.code && (
                  <svg
                    className="w-4 h-4 ml-auto text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Compact variant - minimal design
  if (variant === "compact") {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 rounded text-gray-400 hover:text-white hover:bg-gray-700/30 transition-all duration-200"
          title={`Ngôn ngữ hiện tại: ${currentLang?.name}`}
          aria-label={`Thay đổi ngôn ngữ. Hiện tại: ${currentLang?.name}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <span className="text-base">{currentLang?.flag}</span>
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="language-switcher-dropdown absolute right-0 top-full mt-1 w-32 bg-gray-800 border border-gray-600/50 rounded-md shadow-lg z-50 overflow-hidden">
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-700/50 transition-colors duration-150 ${
                  currentLanguage === language.code
                    ? "bg-blue-600/20 text-blue-400"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <span>{language.flag}</span>
                <span className="text-sm">{language.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default variant - standard design
  return (
    <div className="relative" ref={dropdownRef} style={style}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
      >
        {showIcon && <GlobalOutlined className="text-gray-500" />}
        <span className="text-lg">{currentLang?.flag}</span>
        <span className="text-sm font-medium text-gray-700">
          {currentLang?.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="language-switcher-dropdown absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {availableLanguages.map((language) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 ${
                currentLanguage === language.code
                  ? "bg-blue-50 text-blue-600 border-r-2 border-blue-500"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">{language.flag}</span>
              <span className="text-sm font-medium">{language.name}</span>
              {currentLanguage === language.code && (
                <svg
                  className="w-4 h-4 ml-auto text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
