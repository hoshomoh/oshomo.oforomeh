'use client';

import * as React from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { UIMessage } from 'ai';
import { useSearch } from '../context/search-context';
import { useData } from '../context/data-context';
import { executeToolCall } from '../lib/chat/tool-executor';
import { usePersistedChat } from './use-persisted-chat';
import { useAutoScroll } from './use-auto-scroll';
import type { LLMConfig } from '../lib/types';

type UseChatSessionParams = {
  llmConfig: LLMConfig | undefined;
  dataSummary: string;
};

type UseChatSessionReturn = {
  input: string;
  setInput: (value: string) => void;
  messages: UIMessage[];
  isLoading: boolean;
  error: Error | undefined;
  loaded: boolean;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  handleClear: () => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
};

export function useChatSession({
  llmConfig,
  dataSummary,
}: UseChatSessionParams): UseChatSessionReturn {
  const [input, setInput] = React.useState('');
  const { searchIndex } = useSearch();
  const { accounts, budgets, groups } = useData();
  const { initialMessages, loaded, saveMessages, clearMessages } = usePersistedChat();

  // Ref to hold addToolOutput so onToolCall can call it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addToolOutputRef = React.useRef<any>(null);

  const { messages, sendMessage, status, error, setMessages, addToolOutput } = useChat({
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/expense-wise-web/chat',
      body: {
        provider: llmConfig?.provider,
        model: llmConfig?.model,
        apiKey: llmConfig?.apiKey,
        ollamaBaseUrl: llmConfig?.ollamaBaseUrl,
        dataSummary,
      },
    }),
    onToolCall: async ({ toolCall }) => {
      const result = searchIndex
        ? executeToolCall(toolCall.toolName, toolCall.input as Record<string, unknown>, {
            searchIndex,
            accounts,
            budgets,
            groups,
          })
        : 'Search index is not ready. Please try again in a moment.';

      await addToolOutputRef.current?.({
        toolCallId: toolCall.toolCallId,
        output: result,
      });
    },
  });

  // Keep ref in sync with latest addToolOutput
  React.useEffect(() => {
    addToolOutputRef.current = addToolOutput;
  }, [addToolOutput]);

  const isLoading = status === 'submitted' || status === 'streaming';

  // Persist messages when they change (only after initial load)
  React.useEffect(() => {
    saveMessages(messages, status);
  }, [messages, status, saveMessages]);

  // Auto-scroll to bottom on new messages
  const { scrollRef } = useAutoScroll<HTMLDivElement>([messages]);

  const handleClear = React.useCallback(() => {
    setMessages([]);
    clearMessages();
  }, [setMessages, clearMessages]);

  const handleSend = React.useCallback(() => {
    const text = input.trim();
    if (!text || isLoading) {
      return;
    }
    setInput('');
    sendMessage({ text });
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return {
    input,
    setInput,
    messages,
    isLoading,
    error,
    loaded,
    scrollRef,
    handleClear,
    handleSend,
    handleKeyDown,
  };
}
