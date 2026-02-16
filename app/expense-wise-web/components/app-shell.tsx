'use client';

import * as React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { DataProvider } from '../context/data-context';
import { SearchProvider } from '../context/search-context';
import { TransactionFilterProvider } from '../context/transaction-filter-context';
import { AppSidebar } from './app-sidebar';
import { ChatFAB } from './chat/chat-fab';
import { GlobalSearch } from './global-search';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <DataProvider>
      <SearchProvider>
        <React.Suspense fallback={null}>
          <TransactionFilterProvider>
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>{children}</SidebarInset>
            </SidebarProvider>
            <GlobalSearch />
            <ChatFAB />
            <Toaster />
          </TransactionFilterProvider>
        </React.Suspense>
      </SearchProvider>
    </DataProvider>
  );
}
