import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUITranslations } from '../api/uiTranslationApi';

const UITranslationContext = createContext();

export const useUITranslation = () => {
  const context = useContext(UITranslationContext);
  if (!context) {
    throw new Error('useUITranslation must be used within UITranslationProvider');
  }
  return context;
};

export const UITranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Get language from localStorage or default to 'en'
    return localStorage.getItem('uiLanguage') || 'en';
  });
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);

  const loadTranslations = async (lang) => {
    setLoading(true);
    try {
      console.log('Loading translations for language:', lang);
      const data = await getUITranslations(lang);
      console.log('Received translations data:', data);
      setTranslations(data);
      localStorage.setItem('uiLanguage', lang);
    } catch (error) {
      console.error('Failed to load translations:', error);
      // Fallback to empty object if API fails
      setTranslations({});
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lang) => {
    setCurrentLanguage(lang);
  };

  const t = (key) => {
    return translations[key] || key;
  };

  useEffect(() => {
    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  return (
    <UITranslationContext.Provider value={{
      currentLanguage,
      changeLanguage,
      translations,
      loading,
      t
    }}>
      {children}
    </UITranslationContext.Provider>
  );
};