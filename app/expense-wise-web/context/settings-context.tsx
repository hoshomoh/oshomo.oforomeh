'use client';

import * as React from 'react';
import { getLLMConfig, saveLLMConfig, saveSetting } from '../lib/db';
import type { LLMConfig } from '../lib/types';

type SettingsContextValue = {
  config: LLMConfig | undefined;
  isLoading: boolean;
  saveConfig: (newConfig: LLMConfig) => Promise<void>;
  clearConfig: () => Promise<void>;
};

const SettingsContext = React.createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = React.useState<LLMConfig | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const stored = await getLLMConfig();
        setConfig(stored);
      } catch {
        // If reading fails, leave config undefined
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const saveConfig = React.useCallback(async (newConfig: LLMConfig) => {
    await saveLLMConfig(newConfig);
    setConfig(newConfig);
  }, []);

  const clearConfig = React.useCallback(async () => {
    await saveSetting('llm-config', undefined);
    setConfig(undefined);
  }, []);

  const value = React.useMemo(
    () => ({
      config,
      isLoading,
      saveConfig,
      clearConfig,
    }),
    [config, isLoading, saveConfig, clearConfig],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
