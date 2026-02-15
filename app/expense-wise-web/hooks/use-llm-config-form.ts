'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { PROVIDER_META, type ProviderMeta } from '../lib/constants';
import type { LLMConfig, LLMProvider } from '../lib/types';

export type OllamaModel = {
  name: string;
  size: number;
  details: {
    parameter_size?: string;
    family?: string;
  };
};

type UseLLMConfigFormProps = {
  config: LLMConfig | undefined;
  onSave: (config: LLMConfig) => Promise<void>;
};

type UseLLMConfigFormReturn = {
  provider: LLMProvider;
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  ollamaBaseUrl: string;
  setOllamaBaseUrl: (url: string) => void;
  showApiKey: boolean;
  setShowApiKey: (show: boolean) => void;
  saving: boolean;
  ollamaModels: OllamaModel[];
  fetchingOllamaModels: boolean;
  providerMeta: ProviderMeta;
  handleProviderChange: (provider: LLMProvider) => void;
  handleSave: () => Promise<void>;
  fetchOllamaModels: () => Promise<void>;
};

export function useLLMConfigForm({ config, onSave }: UseLLMConfigFormProps): UseLLMConfigFormReturn {
  const [provider, setProvider] = React.useState<LLMProvider>(config?.provider ?? 'openai');
  const [apiKey, setApiKey] = React.useState(config?.apiKey ?? '');
  const [model, setModel] = React.useState(config?.model ?? '');
  const [ollamaBaseUrl, setOllamaBaseUrl] = React.useState(
    config?.ollamaBaseUrl ?? 'http://localhost:11434',
  );
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [ollamaModels, setOllamaModels] = React.useState<OllamaModel[]>([]);
  const [fetchingOllamaModels, setFetchingOllamaModels] = React.useState(false);

  const providerMeta = PROVIDER_META[provider];

  // Fetch Ollama models
  const fetchOllamaModels = React.useCallback(async () => {
    setFetchingOllamaModels(true);
    try {
      const baseUrl = ollamaBaseUrl.replace(/\/+$/, '');
      const res = await fetch(`${baseUrl}/api/tags`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const models: OllamaModel[] = data.models ?? [];
      setOllamaModels(models);
      if (models.length > 0 && !models.some((m) => m.name === model)) {
        setModel(models[0].name);
      }
      toast.success(`Found ${models.length} installed model${models.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Could not connect to Ollama. Make sure it is running.');
      setOllamaModels([]);
    } finally {
      setFetchingOllamaModels(false);
    }
  }, [ollamaBaseUrl, model]);

  // Handle provider change: update model + fetch Ollama models in the event handler
  const handleProviderChange = React.useCallback(
    (newProvider: LLMProvider) => {
      setProvider(newProvider);
      if (newProvider === 'ollama') {
        // Trigger Ollama model fetch (uses current ollamaBaseUrl)
        fetchOllamaModels();
      } else {
        setOllamaModels([]);
        // Auto-select first model if current model isn't valid for new provider
        const meta = PROVIDER_META[newProvider];
        if (meta.models.length > 0 && !meta.models.find((m) => m.id === model)) {
          setModel(meta.models[0].id);
        }
      }
    },
    [fetchOllamaModels, model],
  );

  const handleSave = React.useCallback(async () => {
    if (providerMeta.requiresApiKey && !apiKey.trim()) {
      toast.error('API key is required for this provider');
      return;
    }
    if (!model.trim()) {
      toast.error('Please select or enter a model name');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        provider,
        apiKey: apiKey.trim(),
        model: model.trim(),
        ollamaBaseUrl: provider === 'ollama' ? ollamaBaseUrl : undefined,
      });
      toast.success('LLM configuration saved');
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }, [providerMeta.requiresApiKey, apiKey, model, onSave, provider, ollamaBaseUrl]);

  return {
    provider,
    apiKey,
    setApiKey,
    model,
    setModel,
    ollamaBaseUrl,
    setOllamaBaseUrl,
    showApiKey,
    setShowApiKey,
    saving,
    ollamaModels,
    fetchingOllamaModels,
    providerMeta,
    handleProviderChange,
    handleSave,
    fetchOllamaModels,
  };
}
