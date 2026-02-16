import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  stepCountIs,
} from 'ai';
import type { UIMessage } from 'ai';
import { ZodError } from 'zod';
import { pipeJsonRender } from '@json-render/core';
import { getModel } from '@/app/expense-wise-web/lib/chat/provider-registry';
import { buildSystemPrompt } from '@/app/expense-wise-web/lib/chat/system-prompt';
import { financialTools } from '@/app/expense-wise-web/lib/chat/tools';
import type { LLMProvider } from '@/app/expense-wise-web/lib/types';
import { chatRequestSchema } from './request-schema';
import { chatLimiter } from './rate-limiter';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!chatLimiter.check(ip)) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded. Please wait before sending more messages.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // Request validation
    const body = await request.json();
    const validatedBody = chatRequestSchema.parse(body);

    const {
      messages,
      provider,
      model: modelId,
      apiKey,
      ollamaBaseUrl,
      dataSummary,
    } = validatedBody;

    // Cast validated types back to expected types for AI SDK
    const llmModel = getModel(provider as LLMProvider, modelId, apiKey, ollamaBaseUrl);
    const systemPrompt = buildSystemPrompt({ dataSummary });
    const modelMessages = await convertToModelMessages(messages as UIMessage[]);

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model: llmModel,
          system: systemPrompt,
          messages: modelMessages,
          tools: financialTools,
          stopWhen: stepCountIs(5),
          abortSignal: AbortSignal.timeout(60000), // 60 second timeout
          providerOptions: {
            openai: {
              store: false,
            },
          },
          onError: (error) => {
            console.error('LLM streaming error:', error);
          },
        });

        writer.merge(pipeJsonRender(result.toUIMessageStream()));
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    // Log for debugging
    console.error('Chat API error:', error);

    // Determine appropriate status code and message
    let status = 500;
    let message = 'An unexpected error occurred';

    if (error instanceof ZodError) {
      status = 400;
      message = 'Invalid request format';
    } else if (error instanceof Error) {
      if (error.message?.includes('API key')) {
        status = 401;
        message = 'Invalid API credentials';
      } else if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
        status = 429;
        message = 'LLM provider rate limit exceeded';
      } else if (error.message?.includes('timeout') || error.name === 'AbortError') {
        status = 504;
        message = 'Request timed out';
      } else {
        message = error.message;
      }
    }

    return new Response(
      JSON.stringify({
        error: message,
        timestamp: new Date().toISOString(),
      }),
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}
