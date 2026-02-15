'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { UIMessage } from 'ai';

type ChatMessageProps = {
  role: 'user' | 'assistant' | 'system';
  parts: UIMessage['parts'];
  className?: string;
};

export function ChatMessage({ role, parts, className }: ChatMessageProps) {
  const isUser = role === 'user';

  // Extract text content from message parts
  const textContent = parts
    .filter(
      (part): part is Extract<UIMessage['parts'][number], { type: 'text' }> => part.type === 'text',
    )
    .map((part) => part.text)
    .join('');

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse', className)}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'rounded-lg px-4 py-2 max-w-[80%]',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
        )}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{textContent}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{textContent}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
