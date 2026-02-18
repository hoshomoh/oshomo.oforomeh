'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { PROVIDER_META, type ProviderMeta } from '../lib/constants';
import type { LLMConfig, LLMProvider, ProviderConfig } from '../lib/types';

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
  currentProvider: LLMProvider; // Active provider in the form
  providers: Partial<Record<LLMProvider, ProviderConfig>>; // All provider configs
  showApiKey: boolean;
  saving: boolean;
  ollamaModels: OllamaModel[];
  fetchingOllamaModels: boolean;
};

type LLMConfigFormAction =
  | { type: 'SET_API_KEY'; provider: LLMProvider; apiKey: string }
  | { type: 'SET_MODEL'; provider: LLMProvider; model: string }
  | { type: 'SET_OLLAMA_BASE_URL'; baseUrl: string }
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
      return {
        ...state,
        providers: {
          ...state.providers,
          [action.provider]: {
            ...state.providers[action.provider],
            apiKey: action.apiKey,
            model: state.providers[action.provider]?.model ?? '',
          },
        },
      };
    case 'SET_MODEL':
      return {
        ...state,
        providers: {
          ...state.providers,
          [action.provider]: {
            ...state.providers[action.provider],
            apiKey: state.providers[action.provider]?.apiKey ?? '',
            model: action.model,
          },
        },
      };
    case 'SET_OLLAMA_BASE_URL':
      return {
        ...state,
        providers: {
          ...state.providers,
          ollama: {
            ...state.providers.ollama,
            apiKey: state.providers.ollama?.apiKey ?? '',
            model: state.providers.ollama?.model ?? '',
            ollamaBaseUrl: action.baseUrl,
          },
        },
      };
    case 'SET_SHOW_API_KEY':
      return { ...state, showApiKey: action.show };
    case 'SET_SAVING':
      return { ...state, saving: action.saving };
    case 'SET_FETCHING_OLLAMA_MODELS':
      return { ...state, fetchingOllamaModels: action.fetching };
    case 'PROVIDER_CHANGE': {
      // Update the active provider pointer; apply default model if the current one is invalid
      const nextProviders =
        action.defaultModel !== undefined
          ? {
              ...state.providers,
              [action.provider]: {
                ...state.providers[action.provider],
                apiKey: state.providers[action.provider]?.apiKey ?? '',
                model: action.defaultModel,
              },
            }
          : state.providers;
      return {
        ...state,
        currentProvider: action.provider,
        ollamaModels: action.provider === 'ollama' ? state.ollamaModels : [],
        providers: nextProviders,
      };
    }
    case 'OLLAMA_FETCH_SUCCESS': {
      const currentModel = state.providers.ollama?.model ?? '';
      const selectedModel = action.selectedModel ?? currentModel;
      return {
        ...state,
        ollamaModels: action.models,
        fetchingOllamaModels: false,
        providers: {
          ...state.providers,
          ollama: {
            ...state.providers.ollama,
            apiKey: state.providers.ollama?.apiKey ?? '',
            model: selectedModel,
            ollamaBaseUrl: state.providers.ollama?.ollamaBaseUrl ?? 'http://localhost:11434',
          },
        },
      };
    }
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
    currentProvider: config?.current ?? 'openai',
    providers: config?.providers ?? {},
    showApiKey: false,
    saving: false,
    ollamaModels: [],
    fetchingOllamaModels: false,
  });

  const currentConfig = state.providers[state.currentProvider];
  const providerMeta = PROVIDER_META[state.currentProvider];

  const fetchOllamaModels = React.useCallback(async () => {
    dispatch({ type: 'SET_FETCHING_OLLAMA_MODELS', fetching: true });
    try {
      const ollamaConfig = state.providers.ollama;
      const baseUrl = (ollamaConfig?.ollamaBaseUrl ?? 'http://localhost:11434').replace(/\/+$/, '');
      const res = await fetch(`${baseUrl}/api/tags`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const models: OllamaModel[] = data.models ?? [];
      const currentModel = ollamaConfig?.model ?? '';
      const selectedModel =
        models.length > 0 && !models.some((m) => m.name === currentModel)
          ? models[0].name
          : undefined;
      dispatch({ type: 'OLLAMA_FETCH_SUCCESS', models, selectedModel });
      toast.success(`Found ${models.length} installed model${models.length !== 1 ? 's' : ''}`);
    } catch {
      toast.error('Could not connect to Ollama. Make sure it is running.');
      dispatch({ type: 'OLLAMA_FETCH_ERROR' });
    }
  }, [state.providers]);

  const handleProviderChange = React.useCallback(
    (newProvider: LLMProvider) => {
      if (newProvider === 'ollama') {
        dispatch({ type: 'PROVIDER_CHANGE', provider: newProvider });
        fetchOllamaModels();
      } else {
        const meta = PROVIDER_META[newProvider];
        const currentModel = state.providers[newProvider]?.model ?? '';
        const defaultModel =
          meta.models.length > 0 && !meta.models.find((m) => m.id === currentModel)
            ? meta.models[0].id
            : undefined;
        dispatch({ type: 'PROVIDER_CHANGE', provider: newProvider, defaultModel });
      }
    },
    [fetchOllamaModels, state.providers],
  );

  const handleSave = React.useCallback(async () => {
    const apiKey = currentConfig?.apiKey ?? '';
    const model = currentConfig?.model ?? '';

    if (providerMeta.requiresApiKey && !apiKey.trim()) {
      toast.error('API key is required for this provider');
      return;
    }
    if (!model.trim()) {
      toast.error('Please select or enter a model name');
      return;
    }

    dispatch({ type: 'SET_SAVING', saving: true });
    try {
      await onSave({
        current: state.currentProvider,
        providers: state.providers,
      });
      toast.success('LLM configuration saved');
    } catch {
      toast.error('Failed to save configuration');
    } finally {
      dispatch({ type: 'SET_SAVING', saving: false });
    }
  }, [currentConfig, providerMeta.requiresApiKey, onSave, state.currentProvider, state.providers]);

  return {
    provider: state.currentProvider,
    apiKey: currentConfig?.apiKey ?? '',
    setApiKey: (key: string) =>
      dispatch({ type: 'SET_API_KEY', provider: state.currentProvider, apiKey: key }),
    model: currentConfig?.model ?? '',
    setModel: (model: string) =>
      dispatch({ type: 'SET_MODEL', provider: state.currentProvider, model }),
    ollamaBaseUrl: currentConfig?.ollamaBaseUrl ?? 'http://localhost:11434',
    setOllamaBaseUrl: (url: string) => dispatch({ type: 'SET_OLLAMA_BASE_URL', baseUrl: url }),
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
