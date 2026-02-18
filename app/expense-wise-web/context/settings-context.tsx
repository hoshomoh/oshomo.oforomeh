'use client';

import * as React from 'react';
import { getLLMConfig, saveLLMConfig, saveSetting } from '../lib/db';
import { preloadOllamaModel } from '../lib/chat/ollama-preload';
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

        // Preload Ollama model if configured
        if (stored?.current === 'ollama') {
          const ollamaConfig = stored.providers.ollama;
          if (ollamaConfig?.model) {
            // Don't await - let it load in background
            preloadOllamaModel({
              model: ollamaConfig.model,
              baseUrl: ollamaConfig.ollamaBaseUrl,
            }).catch((err) => {
              console.warn('Ollama preload failed (non-critical):', err);
            });
          }
        }
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

    // Preload Ollama model if just configured
    if (newConfig.current === 'ollama') {
      const ollamaConfig = newConfig.providers.ollama;
      if (ollamaConfig?.model) {
        // Don't await - let it load in background
        preloadOllamaModel({
          model: ollamaConfig.model,
          baseUrl: ollamaConfig.ollamaBaseUrl,
        }).catch((err) => {
          console.warn('Ollama preload failed (non-critical):', err);
        });
      }
    }
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
