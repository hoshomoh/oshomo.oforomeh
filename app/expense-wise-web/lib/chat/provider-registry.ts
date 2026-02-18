import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import { createGroq } from '@ai-sdk/groq';
import type { LanguageModelV3 } from '@ai-sdk/provider';
import type { LLMProvider } from '../types';

/**
 * Create an AI SDK model instance from a provider config.
 * API keys and base URLs are passed per-request (not stored server-side).
 *
 * For Ollama, we use the OpenAI-compatible endpoint (v1/chat/completions)
 * since the community `ollama-ai-provider` package returns LanguageModelV1
 * which is incompatible with AI SDK v6's LanguageModel type.
 */
export function getModel(
  provider: LLMProvider,
  model: string,
  apiKey: string,
  ollamaBaseUrl?: string,
): LanguageModelV3 {
  switch (provider) {
    case 'openai': {
      const openai = createOpenAI({ apiKey });
      return openai(model);
    }
    case 'anthropic': {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(model);
    }
    case 'google': {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(model);
    }
    case 'mistral': {
      const mistral = createMistral({ apiKey });
      return mistral(model);
    }
    case 'groq': {
      const groq = createGroq({ apiKey });
      return groq(model);
    }
    case 'ollama': {
      // Ollama exposes an OpenAI-compatible API at /v1
      const baseURL = ollamaBaseUrl || 'http://localhost:11434';
      const ollama = createOpenAI({
        baseURL: `${baseURL}/v1`,
        apiKey: 'ollama', // Ollama doesn't need a real API key
      });
      return ollama(model);
    }
    case 'ollama-cloud': {
      // Ollama Cloud uses the same OpenAI-compatible API hosted at ollama.com
      const ollamaCloud = createOpenAI({
        baseURL: 'https://ollama.com/v1',
        apiKey,
      });
      return ollamaCloud(model);
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
