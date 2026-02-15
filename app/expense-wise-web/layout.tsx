import * as React from 'react';
import type { Metadata } from 'next';
import { AppShell } from './components/app-shell';

export const metadata: Metadata = {
  title: 'Expense-Wise Web | Dashboard',
  description:
    'View and analyze your ExpenseWise financial data with interactive dashboards and AI-powered insights.',
};

export default function ExpenseWiseWebLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
