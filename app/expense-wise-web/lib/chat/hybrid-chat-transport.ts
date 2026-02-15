import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  DefaultChatTransport,
  stepCountIs,
} from 'ai';
import type { ChatTransport, UIMessage, UIMessageChunk } from 'ai';
import { pipeJsonRender } from '@json-render/core';
import { getModel } from './provider-registry';
import { buildSystemPrompt } from './system-prompt';
import { financialTools } from './tools';
import type { LLMConfig } from '../types';

type HybridChatTransportOptions = {
  llmConfig: LLMConfig;
  dataSummary: string;
  api?: string;
};

/**
 * A chat transport that routes LLM calls based on the provider:
 * - Ollama: runs streamText() directly in the browser (reaches user's local instance)
 * - Cloud providers: delegates to DefaultChatTransport via the API route
 */
export class HybridChatTransport implements ChatTransport<UIMessage> {
  private readonly llmConfig: LLMConfig;
  private readonly dataSummary: string;
  private readonly cloudTransport: DefaultChatTransport<UIMessage>;

  constructor({
    llmConfig,
    dataSummary,
    api = '/api/expense-wise-web/chat',
  }: HybridChatTransportOptions) {
    this.llmConfig = llmConfig;
    this.dataSummary = dataSummary;

    this.cloudTransport = new DefaultChatTransport({
      api,
      prepareSendMessagesRequest(request) {
        const cleanMessages = request.messages.map((msg) => ({
          ...msg,
          providerMetadata: undefined,
          parts: msg.parts?.map((part) => {
            const {
              providerMetadata: _pm,
              callProviderMetadata: _cpm,
              ...rest
            } = part as Record<string, unknown>;
            return rest;
          }),
        }));

        return {
          body: {
            messages: cleanMessages,
            provider: llmConfig.provider,
            model: llmConfig.model,
            apiKey: llmConfig.apiKey,
            ollamaBaseUrl: llmConfig.ollamaBaseUrl,
            dataSummary,
            ...request.body,
          },
        };
      },
    });
  }

  async sendMessages(
    options: Parameters<ChatTransport<UIMessage>['sendMessages']>[0],
  ): Promise<ReadableStream<UIMessageChunk>> {
    if (this.llmConfig.provider === 'ollama') {
      return this.sendMessagesClientSide(options);
    }
    return this.cloudTransport.sendMessages(options);
  }

  async reconnectToStream(
    options: Parameters<ChatTransport<UIMessage>['reconnectToStream']>[0],
  ): Promise<ReadableStream<UIMessageChunk> | null> {
    if (this.llmConfig.provider === 'ollama') {
      return null;
    }
    return this.cloudTransport.reconnectToStream(options);
  }

  private async sendMessagesClientSide({
    messages,
    abortSignal,
  }: Parameters<ChatTransport<UIMessage>['sendMessages']>[0]): Promise<
    ReadableStream<UIMessageChunk>
  > {
    const llmModel = getModel(
      this.llmConfig.provider,
      this.llmConfig.model,
      this.llmConfig.apiKey,
      this.llmConfig.ollamaBaseUrl,
    );
    const systemPrompt = buildSystemPrompt({ dataSummary: this.dataSummary });
    const modelMessages = await convertToModelMessages(messages);

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model: llmModel,
          system: systemPrompt,
          messages: modelMessages,
          tools: financialTools,
          stopWhen: stepCountIs(5),
          abortSignal,
          providerOptions: {
            openai: {
              store: false,
            },
          },
        });

        writer.merge(pipeJsonRender(result.toUIMessageStream()));
      },
    });

    return stream;
  }
}
