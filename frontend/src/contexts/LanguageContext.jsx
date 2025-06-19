import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Get initial language from localStorage or default to 'en'
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("preferred-language");
    return savedLanguage || "en";
  });

  // Available languages
  const availableLanguages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  ];

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem("preferred-language", currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (languageCode) => {
    if (availableLanguages.some((lang) => lang.code === languageCode)) {
      setCurrentLanguage(languageCode);
    }
  };

  const getCurrentLanguage = () => {
    return (
      availableLanguages.find((lang) => lang.code === currentLanguage) ||
      availableLanguages[0]
    );
  };

  const isVietnamese = () => currentLanguage === "vi";
  const isEnglish = () => currentLanguage === "en";

  const value = {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    getCurrentLanguage,
    isVietnamese,
    isEnglish,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
