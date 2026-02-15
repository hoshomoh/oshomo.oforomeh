'use client';

import * as React from 'react';
import { getLLMConfig, saveLLMConfig, saveSetting } from '../lib/db';
import type { LLMConfig } from '../lib/types';

export function useSettings() {
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

  return {
    config,
    isLoading,
    saveConfig,
    clearConfig,
  };
}
