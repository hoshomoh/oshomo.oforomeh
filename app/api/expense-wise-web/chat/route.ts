import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
} from 'ai';
import type { UIMessage } from 'ai';
import { pipeJsonRender } from '@json-render/core';
import { getModel } from '@/app/expense-wise-web/lib/chat/provider-registry';
import { buildSystemPrompt } from '@/app/expense-wise-web/lib/chat/system-prompt';
import { financialTools } from '@/app/expense-wise-web/lib/chat/tools';
import type { LLMProvider } from '@/app/expense-wise-web/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      messages,
      provider,
      model: modelId,
      apiKey,
      ollamaBaseUrl,
      dataSummary,
    } = body as {
      messages: UIMessage[];
      provider: LLMProvider;
      model: string;
      apiKey: string;
      ollamaBaseUrl?: string;
      dataSummary: string;
    };

    const llmModel = getModel(provider, modelId, apiKey, ollamaBaseUrl);
    const systemPrompt = buildSystemPrompt({ dataSummary });
    const modelMessages = await convertToModelMessages(messages);

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model: llmModel,
          system: systemPrompt,
          messages: modelMessages,
          tools: financialTools,
          stopWhen: stepCountIs(5),
          providerOptions: {
            openai: {
              store: false,
            },
          },
        });

        writer.merge(pipeJsonRender(result.toUIMessageStream()));
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
