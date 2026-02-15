'use client';

import * as React from 'react';
import { Send, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChatMessage } from './chat-message';
import { cn } from '@/lib/utils';
import { useChatSession } from '../../hooks/use-chat-session';
import type { LLMConfig } from '../../lib/types';

type ChatInterfaceProps = {
  llmConfig: LLMConfig | undefined;
  dataSummary: string;
  className?: string;
};

export function ChatInterface({ llmConfig, dataSummary, className }: ChatInterfaceProps) {
  const {
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
  } = useChatSession({ llmConfig, dataSummary });

  if (!llmConfig) {
    return (
      <div className={cn('flex items-center justify-center h-full p-4', className)}>
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Configure an LLM provider in{' '}
            <a href="/expense-wise-web/settings" className="font-medium underline">
              Settings
            </a>{' '}
            to start chatting with your financial data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!loaded) {
    return null;
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Ask a question about your financial data...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role as 'user' | 'assistant'}
                parts={message.parts}
              />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Error */}
      {error && (
        <div className="px-4 pb-2">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error.message}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances..."
            className="min-h-[44px] max-h-[120px] resize-none"
            rows={1}
            disabled={isLoading}
          />
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              size="icon"
              disabled={!input.trim() || isLoading}
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </Button>
            {messages.length > 0 && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleClear}
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
