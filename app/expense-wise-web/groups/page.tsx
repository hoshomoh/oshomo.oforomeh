'use client';

import * as React from 'react';
import { useData } from '../context/data-context';
import { PageHeader } from '../components/page-header';
import GroupExpenses from '../components/group-expenses';
import { EmptyState } from '../components/empty-state';

export default function GroupsPage() {
  const { transactions, accounts, groups, hasData, isLoading } = useData();

  if (isLoading) {
    return null;
  }
  if (!hasData) {
    return <EmptyState />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Groups"
        description={`${groups.length} group${groups.length !== 1 ? 's' : ''}`}
      />
      <GroupExpenses groups={groups} transactions={transactions} accounts={accounts} />
    </div>
  );
}
