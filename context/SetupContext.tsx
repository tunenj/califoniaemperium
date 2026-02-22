import React, { createContext, useContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SetupContextType = {
  data: Record<string, any>;
  update: (v: Record<string, any>) => void;
  saveDraft: () => Promise<void>;
  loadDraft: () => Promise<void>;
  clear: () => Promise<void>;
};

const SetupContext = createContext<SetupContextType | null>(null);

export function SetupProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Record<string, any>>({});

  const update = (v: Record<string, any>) =>
    setData((prev) => ({ ...prev, ...v }));

  const saveDraft = async () => {
    await AsyncStorage.setItem("setup_draft", JSON.stringify(data));
  };

  const loadDraft = async () => {
    const draft = await AsyncStorage.getItem("setup_draft");
    if (draft) setData(JSON.parse(draft));
  };

  const clear = async () => {
    await AsyncStorage.removeItem("setup_draft");
    setData({});
  };

  return (
    <SetupContext.Provider
      value={{ data, update, saveDraft, loadDraft, clear }}
    >
      {children}
    </SetupContext.Provider>
  );
}

export function useSetup() {
  const ctx = useContext(SetupContext);
  if (!ctx) {
    throw new Error("useSetup must be used inside SetupProvider");
  }
  return ctx;
}
