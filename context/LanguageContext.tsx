// context/LanguageContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import i18n from '@/lib/i18n';
import { TFunction } from 'i18next';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
];

interface LanguageContextProps {
  language: Language | null;
  setLanguage: (language: Language) => void;
  t: TFunction;
  languages: Language[];
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language | null>(null);

  const setLanguage = async (lang: Language) => {
    await i18n.changeLanguage(lang.code);
    setLanguageState(lang);
  };

  const t: TFunction = i18n.t;

  // Load initial language
  useEffect(() => {
    const currentLangCode = i18n.language;
    const lang = LANGUAGES.find(l => l.code === currentLangCode);
    if (lang) {
      setLanguageState(lang);
    }
  }, []);

  // Listen for language changes from i18n
  useEffect(() => {
    const handleLanguageChange = (langCode: string) => {
      const lang = LANGUAGES.find(l => l.code === langCode);
      if (lang) {
        setLanguageState(lang);
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};