'use client';

import * as React from 'react';
import { useChat } from '@ai-sdk/react';
import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import type { UIMessage } from 'ai';
import { useSearch } from '../context/search-context';
import { useData } from '../context/data-context';
import { executeToolCall } from '../lib/chat/tool-executor';
import { HybridChatTransport } from '../lib/chat/hybrid-chat-transport';
import { usePersistedChat } from './use-persisted-chat';
import { useAutoScroll } from './use-auto-scroll';
import { useExchangeRates } from './use-exchange-rates';
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
  setError: (error: Error | undefined) => void;
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
  const [customError, setCustomError] = React.useState<Error | undefined>(undefined);
  const { searchIndex } = useSearch();
  const { accounts, budgets, groups } = useData();
  const { rates: exchangeRates } = useExchangeRates();
  const { initialMessages, loaded, saveMessages, clearMessages } = usePersistedChat();

  // Display-only history from previous sessions — never sent to the LLM
  const historyRef = React.useRef<UIMessage[]>([]);
  const [historyMessages, setHistoryMessages] = React.useState<UIMessage[]>([]);

  const transport = React.useMemo(
    () => (llmConfig ? new HybridChatTransport({ llmConfig, dataSummary }) : undefined),
    [llmConfig, dataSummary],
  );

  const { messages, sendMessage, status, error, setMessages, addToolOutput } = useChat({
    transport,
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall: async ({ toolCall }) => {
      let result: string;
      try {
        result = searchIndex
          ? executeToolCall(toolCall.toolName, toolCall.input as Record<string, unknown>, {
              searchIndex,
              accounts,
              budgets,
              groups,
              exchangeRates,
            })
          : 'Search index is not ready. Please try again in a moment.';
      } catch (err) {
        result = `Tool error: ${err instanceof Error ? err.message : 'Unknown error'}`;
      }

      addToolOutput({
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: result,
      });
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Restore persisted messages as display-only history (not fed to the LLM)
  React.useEffect(() => {
    if (loaded && initialMessages && initialMessages.length > 0) {
      historyRef.current = initialMessages;
      setHistoryMessages(initialMessages);
    }
  }, [loaded, initialMessages]);

  // Merge history + current session for display
  const displayMessages = React.useMemo(
    () => [...historyMessages, ...messages],
    [historyMessages, messages],
  );

  // Persist combined messages when current session messages change
  React.useEffect(() => {
    const combined = [...historyRef.current, ...messages];
    saveMessages(combined, status);
  }, [messages, status, saveMessages]);

  // Auto-scroll to bottom on new messages
  const { scrollRef } = useAutoScroll<HTMLDivElement>([displayMessages]);

  const handleClear = React.useCallback(() => {
    historyRef.current = [];
    setHistoryMessages([]);
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
    messages: displayMessages,
    isLoading,
    error: customError || error,
    setError: setCustomError,
    loaded,
    scrollRef,
    handleClear,
    handleSend,
    handleKeyDown,
  };
}
