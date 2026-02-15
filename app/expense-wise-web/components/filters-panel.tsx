'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { DATE_PRESET_LABELS } from '../lib/constants';
import { useFilteredOptions } from '../hooks/use-filtered-options';
import type {
  DashboardFilters,
  ParsedAccount,
  ParsedGroup,
  ParsedTransaction,
  DateRangePreset,
} from '../lib/types';

interface FiltersPanelProps {
  filters: DashboardFilters;
  onFilterChange: (filters: Partial<DashboardFilters>) => void;
  accounts: ParsedAccount[];
  currencies: string[];
  groups?: ParsedGroup[];
  transactions?: ParsedTransaction[];
}

export const FiltersPanel = React.memo(function FiltersPanel({
  filters,
  onFilterChange,
  accounts,
  currencies,
  groups,
  transactions,
}: FiltersPanelProps) {
  const { filteredAccounts, filteredGroups, handleCurrencyChange, handleAccountChange } =
    useFilteredOptions({ filters, onFilterChange, accounts, transactions, groups });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Date preset selector */}
      <Select
        value={filters.datePreset}
        onValueChange={(value: string) => onFilterChange({ datePreset: value as DateRangePreset })}
      >
        <SelectTrigger className="w-full sm:w-[160px]" size="sm">
          <SelectValue placeholder="Date range" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(DATE_PRESET_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Custom date range (visible only when preset is 'custom') */}
      {filters.datePreset === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'w-full sm:w-[280px] justify-start text-left font-normal',
                !filters.dateRange.from && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="size-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                    {format(filters.dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(filters.dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 max-w-[calc(100vw-2rem)]" align="start">
            <Calendar
              mode="range"
              selected={{
                from: filters.dateRange.from,
                to: filters.dateRange.to,
              }}
              onSelect={(range) => {
                if (range?.from) {
                  onFilterChange({
                    dateRange: {
                      from: range.from,
                      to: range.to ?? range.from,
                    },
                  });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}

      {/* Currency filter */}
      <Select value={filters.currency} onValueChange={handleCurrencyChange}>
        <SelectTrigger className="w-full sm:w-[150px]" size="sm">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Currencies</SelectItem>
          {currencies.map((currency) => (
            <SelectItem key={currency} value={currency}>
              {currency}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Account filter */}
      <Select value={filters.accountId} onValueChange={handleAccountChange}>
        <SelectTrigger className="w-full sm:w-[160px]" size="sm">
          <SelectValue placeholder="Account" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Accounts</SelectItem>
          {filteredAccounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Group filter */}
      {filteredGroups && filteredGroups.length > 0 && (
        <Select
          value={filters.groupId}
          onValueChange={(value: string) => onFilterChange({ groupId: value })}
        >
          <SelectTrigger className="w-full sm:w-[160px]" size="sm">
            <SelectValue placeholder="Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {filteredGroups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
});
