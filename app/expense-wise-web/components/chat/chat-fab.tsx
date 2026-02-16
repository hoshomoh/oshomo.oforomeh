'use client';

import * as React from 'react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ChatInterface } from './chat-interface';
import { useData } from '../../context/data-context';
import { useSettings } from '../../context/settings-context';
import { useChat } from '../../context/chat-context';
import { buildDataSummary } from '../../lib/chat/data-summary';

export function ChatFAB() {
  const { isOpen, open, close } = useChat();
  const { transactions, accounts, budgets, groups, hasData } = useData();
  const { config } = useSettings();

  const dataSummary = React.useMemo(
    () => buildDataSummary(transactions, accounts, budgets, groups),
    [transactions, accounts, budgets, groups],
  );

  // Don't show FAB if no data is loaded
  if (!hasData) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <Button
          onClick={open}
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <MessageSquare className="h-6 w-6" />
          {!config && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
            </span>
          )}
        </Button>
      )}

      {/* Chat Sheet */}
      <Sheet open={isOpen} onOpenChange={(open) => (open ? open : close())}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-full sm:w-[450px] sm:max-w-[450px] p-0 flex flex-col"
        >
          <SheetHeader className="px-4 py-3 border-b shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base">Chat with your data</SheetTitle>
              <Button variant="ghost" size="icon" onClick={close} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="flex-1 min-h-0">
            <ChatInterface llmConfig={config} dataSummary={dataSummary} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
