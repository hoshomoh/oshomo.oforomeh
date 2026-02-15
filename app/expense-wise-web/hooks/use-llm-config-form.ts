'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { PROVIDER_META, type ProviderMeta } from '../lib/constants';
import type { LLMConfig, LLMProvider } from '../lib/types';

type OllamaModel = {
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

type LLMConfigFormState = {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  ollamaBaseUrl: string;
  showApiKey: boolean;
  saving: boolean;
  ollamaModels: OllamaModel[];
  fetchingOllamaModels: boolean;
};

type LLMConfigFormAction =
  | { type: 'SET_API_KEY'; apiKey: string }
  | { type: 'SET_MODEL'; model: string }
  | { type: 'SET_OLLAMA_BASE_URL'; url: string }
  | { type: 'SET_SHOW_API_KEY'; show: boolean }
  | { type: 'SET_SAVING'; saving: boolean }
  | { type: 'SET_FETCHING_OLLAMA_MODELS'; fetching: boolean }
  | { type: 'PROVIDER_CHANGE'; provider: LLMProvider; defaultModel?: string }
  | { type: 'OLLAMA_FETCH_SUCCESS'; models: OllamaModel[]; selectedModel?: string }
  | { type: 'OLLAMA_FETCH_ERROR' };

function llmConfigFormReducer(
  state: LLMConfigFormState,
  action: LLMConfigFormAction,
): LLMConfigFormState {
  switch (action.type) {
    case 'SET_API_KEY':
      return { ...state, apiKey: action.apiKey };
    case 'SET_MODEL':
      return { ...state, model: action.model };
    case 'SET_OLLAMA_BASE_URL':
      return { ...state, ollamaBaseUrl: action.url };
    case 'SET_SHOW_API_KEY':
      return { ...state, showApiKey: action.show };
    case 'SET_SAVING':
      return { ...state, saving: action.saving };
    case 'SET_FETCHING_OLLAMA_MODELS':
      return { ...state, fetchingOllamaModels: action.fetching };
    case 'PROVIDER_CHANGE':
      return {
        ...state,
        provider: action.provider,
        ollamaModels: action.provider === 'ollama' ? state.ollamaModels : [],
        model: action.defaultModel ?? state.model,
      };
    case 'OLLAMA_FETCH_SUCCESS':
      return {
        ...state,
        ollamaModels: action.models,
        fetchingOllamaModels: false,
        model: action.selectedModel ?? state.model,
      };
    case 'OLLAMA_FETCH_ERROR':
      return { ...state, ollamaModels: [], fetchingOllamaModels: false };
    default:
      return state;
  }
}

export function useLLMConfigForm({
  config,
  onSave,
}: UseLLMConfigFormProps): UseLLMConfigFormReturn {
  const [state, dispatch] = React.useReducer(llmConfigFormReducer, {
    provider: config?.provider ?? 'openai',
    apiKey: config?.apiKey ?? '',
    model: config?.model ?? '',
    ollamaBaseUrl: config?.ollamaBaseUrl ?? 'http://localhost:11434',
    showApiKey: false,
    saving: false,
    ollamaModels: [],
    fetchingOllamaModels: false,
  });

  const providerMeta = PROVIDER_META[state.provider];

  const fetchOllamaModels = React.useCallback(async () => {
    dispatch({ type: 'SET_FETCHING_OLLAMA_MODELS', fetching: true });
    try {
      const baseUrl = state.ollamaBaseUrl.replace(/\/+$/, '');
      const res = await fetch(`${baseUrl}/api/tags`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const models: OllamaModel[] = data.models ?? [];
      const selectedModel =
        models.length > 0 && !models.some((m) => m.name === state.model)
          ? models[0].name
          : undefined;
      dispatch({ type: 'OLLAMA_FETCH_SUCCESS', models, selectedModel });
      toast.success(`Found ${models.length} installed model${models.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Could not connect to Ollama. Make sure it is running.');
      dispatch({ type: 'OLLAMA_FETCH_ERROR' });
    }
  }, [state.ollamaBaseUrl, state.model]);

  const handleProviderChange = React.useCallback(
    (newProvider: LLMProvider) => {
      if (newProvider === 'ollama') {
        dispatch({ type: 'PROVIDER_CHANGE', provider: newProvider });
        fetchOllamaModels();
      } else {
        const meta = PROVIDER_META[newProvider];
        const defaultModel =
          meta.models.length > 0 && !meta.models.find((m) => m.id === state.model)
            ? meta.models[0].id
            : undefined;
        dispatch({ type: 'PROVIDER_CHANGE', provider: newProvider, defaultModel });
      }
    },
    [fetchOllamaModels, state.model],
  );

  const handleSave = React.useCallback(async () => {
    if (providerMeta.requiresApiKey && !state.apiKey.trim()) {
      toast.error('API key is required for this provider');
      return;
    }
    if (!state.model.trim()) {
      toast.error('Please select or enter a model name');
      return;
    }

    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      await onSave({
        provider: state.provider,
        apiKey: state.apiKey.trim(),
        model: state.model.trim(),
        ollamaBaseUrl: state.provider === 'ollama' ? state.ollamaBaseUrl : undefined,
      });
      toast.success('LLM configuration saved');
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [
    providerMeta.requiresApiKey,
    state.apiKey,
    state.model,
    onSave,
    state.provider,
    state.ollamaBaseUrl,
  ]);

  return {
    provider: state.provider,
    apiKey: state.apiKey,
    setApiKey: (key: string) => dispatch({ type: 'SET_API_KEY', apiKey: key }),
    model: state.model,
    setModel: (model: string) => dispatch({ type: 'SET_MODEL', model }),
    ollamaBaseUrl: state.ollamaBaseUrl,
    setOllamaBaseUrl: (url: string) => dispatch({ type: 'SET_OLLAMA_BASE_URL', url }),
    showApiKey: state.showApiKey,
    setShowApiKey: (show: boolean) => dispatch({ type: 'SET_SHOW_API_KEY', show }),
    saving: state.saving,
    ollamaModels: state.ollamaModels,
    fetchingOllamaModels: state.fetchingOllamaModels,
    providerMeta,
    handleProviderChange,
    handleSave,
    fetchOllamaModels,
  };
}
