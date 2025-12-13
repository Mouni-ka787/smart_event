'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { t, Language, TranslationKey } from '@/lib/translations';
import translations from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('language') as Language | null;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    // Allow all languages that exist in translations
    if (translations[newLanguage]) {
      setLanguageState(newLanguage);
      localStorage.setItem('language', newLanguage);
      
      // Dispatch a custom event to notify components about language change
      window.dispatchEvent(new CustomEvent('languageChange', { detail: newLanguage }));
    }
  };

  const translate = (key: TranslationKey): string => {
    return t(key, language);
  };

  const value = {
    language,
    setLanguage,
    translate,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}