import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, AppLanguage, PromptFormat } from '../types';
import { getSettings, saveSettings } from '../services/db';
import { translations } from '../utils/translations';

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'dark',
    language: AppLanguage.VI,
    defaultOutput: PromptFormat.TEXT,
    highlightAI: true
  });

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await getSettings();
      setSettings(saved);
      // Apply theme on initial load
      applyTheme(saved.theme);
    };
    loadSettings();
  }, []);

  const applyTheme = (theme: 'dark' | 'light') => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await saveSettings(updated);
    if (newSettings.theme) {
      applyTheme(newSettings.theme);
    }
  };

  const t = (key: string): string => {
    // @ts-ignore
    return translations[settings.language][key] || key;
  };

  return (
    <AppContext.Provider value={{ settings, updateSettings, t }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};