'use client';

import { ArrowLeftRight, Search, Wallet, LayoutDashboard, PieChart, Users } from 'lucide-react';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getCategoryMeta } from '../lib/constants';
import { formatCurrency } from '../lib/format';
import { useGlobalSearch } from '../hooks/use-global-search';

export function GlobalSearch() {
  const {
    open,
    query,
    setQuery,
    results,
    matchingAccounts,
    matchingGroups,
    hasAnyResults,
    hasData,
    handleSelect,
    handleOpenChange,
  } = useGlobalSearch();

  if (!hasData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogHeader className="sr-only">
        <DialogTitle>Search</DialogTitle>
        <DialogDescription>Search your financial data</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0" showCloseButton={false}>
        <Command
          shouldFilter={false}
          className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          <CommandInput
            placeholder="Search transactions, accounts, groups..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {query.trim() && !hasAnyResults && <CommandEmpty>No results found.</CommandEmpty>}

            {/* Search action */}
            {query.trim() && (
              <CommandGroup heading="Search">
                <CommandItem
                  value={`search-${query}`}
                  onSelect={() =>
                    handleSelect(
                      `/expense-wise-web/transactions?search=${encodeURIComponent(query)}`,
                    )
                  }
                >
                  <Search className="size-4 shrink-0" />
                  <span>Search for &ldquo;{query}&rdquo;</span>
                </CommandItem>
              </CommandGroup>
            )}

            {/* Transaction results */}
            {results && results.hits.length > 0 && (
              <CommandGroup heading="Transactions">
                {results.hits.map((hit) => {
                  const doc = hit.document;
                  const meta = getCategoryMeta(doc.categoryId);
                  const Icon = meta.icon;
                  return (
                    <CommandItem
                      key={doc.id}
                      value={`tx-${doc.description} ${doc.categoryLabel} ${doc.accountName}`}
                      onSelect={() =>
                        handleSelect(
                          `/expense-wise-web/transactions?search=${encodeURIComponent(doc.description || doc.categoryLabel)}`,
                        )
                      }
                    >
                      <Icon className="size-4 shrink-0" style={{ color: meta.color }} />
                      <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                        <div className="min-w-0">
                          <p className="text-sm truncate">{doc.description || doc.categoryLabel}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {doc.accountName} &middot; {doc.date}
                          </p>
                        </div>
                        <span className="text-sm font-medium tabular-nums shrink-0">
                          {doc.type === 'income' ? '+' : ''}
                          {formatCurrency(doc.amount, doc.currency)}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}

            {/* Account results */}
            {matchingAccounts.length > 0 && (
              <CommandGroup heading="Accounts">
                {matchingAccounts.map((account) => (
                  <CommandItem
                    key={account.id}
                    value={`acc-${account.name} ${account.currency}`}
                    onSelect={() => handleSelect(`/expense-wise-web/accounts/${account.id}`)}
                  >
                    <Wallet className="size-4 shrink-0" />
                    <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm truncate">{account.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {account.currency} &middot; {account.country}
                        </p>
                      </div>
                      <span className="text-sm font-medium tabular-nums shrink-0">
                        {formatCurrency(account.balance, account.currency)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Group results */}
            {matchingGroups.length > 0 && (
              <CommandGroup heading="Groups">
                {matchingGroups.map((group) => (
                  <CommandItem
                    key={group.id}
                    value={`grp-${group.name} ${group.type}`}
                    onSelect={() =>
                      handleSelect(
                        `/expense-wise-web/transactions?groupId=${encodeURIComponent(group.id)}`,
                      )
                    }
                  >
                    <Users className="size-4 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.type}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandSeparator />

            <CommandGroup heading="Quick Navigation">
              <CommandItem onSelect={() => handleSelect('/expense-wise-web')}>
                <LayoutDashboard className="size-4" />
                <span>Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect('/expense-wise-web/transactions')}>
                <ArrowLeftRight className="size-4" />
                <span>All Transactions</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect('/expense-wise-web/accounts')}>
                <Wallet className="size-4" />
                <span>Accounts</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect('/expense-wise-web/budgets')}>
                <PieChart className="size-4" />
                <span>Budgets</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect('/expense-wise-web/groups')}>
                <Users className="size-4" />
                <span>Groups</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
