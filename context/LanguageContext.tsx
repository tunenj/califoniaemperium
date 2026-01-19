import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  isReady: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguageState] = useState("en");
  const [isReady, setIsReady] = useState(false);

  // Load saved language on app start
  useEffect(() => {
    (async () => {
      const savedLanguage = await AsyncStorage.getItem("app_language");
      if (savedLanguage) {
        setLanguageState(savedLanguage);
      }
      setIsReady(true);
    })();
  }, []);

  const setLanguage = async (lang: string) => {
    setLanguageState(lang);
    await AsyncStorage.setItem("app_language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
