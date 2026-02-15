'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import { useJsonRenderMessage } from '@json-render/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { ChatRenderer } from './chat-renderer';
import type { UIMessage } from 'ai';

type ChatMessageProps = {
  role: 'user' | 'assistant' | 'system';
  parts: UIMessage['parts'];
  className?: string;
};

export function ChatMessage({ role, parts, className }: ChatMessageProps) {
  const isUser = role === 'user';

  // Filter out reasoning parts so they don't appear as visible text
  const visibleParts = React.useMemo(() => parts.filter((p) => p.type !== 'reasoning'), [parts]);

  const { spec, text, hasSpec } = useJsonRenderMessage(visibleParts);

  // Don't render assistant bubbles that have no content yet
  // (e.g. tool-only messages during multistep calls)
  if (!isUser && !text && !hasSpec) {
    return null;
  }

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse', className)}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'rounded-lg px-4 py-2',
          isUser ? 'bg-primary text-primary-foreground max-w-[80%]' : 'bg-muted w-full',
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="space-y-3">
            {text && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{text}</ReactMarkdown>
              </div>
            )}
            {hasSpec && <ChatRenderer spec={spec} />}
          </div>
        )}
      </div>
    </div>
  );
}
