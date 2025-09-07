'use client';

import Link from 'next/link';
import React from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

import { cn } from '@/lib/utils';

type Crumb = {
  /** Visible text, e.g. "oshomo" */
  label: string;
  /** Link target. If omitted, renders as the current page (non-clickable). */
  href?: string;
  /** If true, opens in a new tab with rel="noreferrer" */
  external?: boolean;
  /** Force mark this item as the current page (non-clickable) */
  current?: boolean;
};

type HeaderProps = {
  /** Breadcrumb items in left-to-right order */
  items: Crumb[];
  /** Show the theme toggle button (default: true) */
  showThemeToggle?: boolean;
};

export default function Header({ items, showThemeToggle = true }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const updatedItems = [{ label: 'oshomo', href: '/' }, ...items];

  return (
    <header className={cn('flex items-center justify-between py-4')}>
      {/* Breadcrumb navigation */}
      <Breadcrumb>
        <BreadcrumbList className="font-medium text-base">
          {updatedItems.map((item, i) => {
            const isLast = i === updatedItems.length - 1;
            const isCurrent = item.current || !item.href;

            return (
              <BreadcrumbItem key={`${item.label}-${i}`}>
                {isCurrent ? (
                  <BreadcrumbPage className="text-foreground">{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link
                      href={item.href!}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noreferrer' : undefined}
                      className={cn(
                        'text-foreground transition-colors hover:underline underline-offset-4',
                      )}
                    >
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
                {!isLast && <span className="text-foreground">/</span>}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Theme toggle */}
      {showThemeToggle && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-[1.25rem] w-[1.25rem]" />
          ) : (
            <Sun className="h-[1.25rem] w-[1.25rem]" />
          )}
        </Button>
      )}
    </header>
  );
}
