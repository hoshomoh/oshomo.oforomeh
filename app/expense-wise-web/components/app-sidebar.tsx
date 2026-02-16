'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  Users,
  Settings,
  Home,
  Search,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

const navItems = [
  {
    label: 'Dashboard',
    href: '/expense-wise-web',
    icon: LayoutDashboard,
  },
  {
    label: 'Transactions',
    href: '/expense-wise-web/transactions',
    icon: ArrowLeftRight,
  },
  {
    label: 'Accounts',
    href: '/expense-wise-web/accounts',
    icon: Wallet,
  },
  {
    label: 'Budgets',
    href: '/expense-wise-web/budgets',
    icon: PieChart,
  },
  {
    label: 'Groups',
    href: '/expense-wise-web/groups',
    icon: Users,
  },
  {
    label: 'Settings',
    href: '/expense-wise-web/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile, isMobile } = useSidebar();

  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="space-y-2">
        <Link
          href="/expense-wise-web"
          className="flex items-center gap-2 px-2 py-1 hover:opacity-80 transition-opacity"
          onClick={handleNavClick}
        >
          <Wallet className="size-5 text-primary" />
          <span className="text-lg font-semibold">Expense-Wise</span>
        </Link>
        <button
          type="button"
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          }}
          className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors w-full"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.href === '/expense-wise-web'
                        ? pathname === '/expense-wise-web'
                        : pathname === item.href || pathname.startsWith(item.href + '/')
                    }
                    tooltip={item.label}
                  >
                    <Link href={item.href} onClick={handleNavClick}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/" onClick={handleNavClick}>
            <Home className="size-4" />
            <span>Back to Website</span>
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
