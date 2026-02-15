'use client';

import * as React from 'react';
import { defineRegistry, type ComponentFn } from '@json-render/react';
import ReactMarkdown from 'react-markdown';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import { useChatNavigation } from '../../hooks/use-chat-navigation';
import { catalog } from './catalog';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#06b6d4',
  '#84cc16',
];

type CatalogType = typeof catalog;

const TextComponent: ComponentFn<CatalogType, 'Text'> = ({ props }) => (
  <div className="prose prose-sm dark:prose-invert max-w-none">
    <ReactMarkdown>{props.content}</ReactMarkdown>
  </div>
);

const SummaryCardComponent: ComponentFn<CatalogType, 'SummaryCard'> = ({ props }) => (
  <Card className="w-full">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{props.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold">{props.value}</span>
        {props.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
        {props.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
        {props.trend === 'neutral' && <Minus className="h-4 w-4 text-muted-foreground" />}
      </div>
      {props.description && (
        <p className="text-xs text-muted-foreground mt-1">{props.description}</p>
      )}
    </CardContent>
  </Card>
);

const CategoryPieChartComponent: ComponentFn<CatalogType, 'CategoryPieChart'> = ({ props }) => {
  const { navigateToCategory } = useChatNavigation();

  return (
    <Card className="w-full">
      {props.title && (
        <CardHeader>
          <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={props.data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={90}
              paddingAngle={2}
              cursor="pointer"
              onClick={(entry) => navigateToCategory(entry.label)}
            >
              {props.data.map((_entry, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) =>
                props.currency ? `${props.currency} ${value.toFixed(2)}` : value.toFixed(2)
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const BarChartComponent: ComponentFn<CatalogType, 'BarChart'> = ({ props }) => (
  <Card className="w-full">
    {props.title && (
      <CardHeader>
        <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
      </CardHeader>
    )}
    <CardContent>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={props.data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="label" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Bar dataKey="value" fill={props.color || 'hsl(var(--chart-1))'} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const IncomeExpenseChartComponent: ComponentFn<CatalogType, 'IncomeExpenseChart'> = ({ props }) => (
  <Card className="w-full">
    {props.title && (
      <CardHeader>
        <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
      </CardHeader>
    )}
    <CardContent>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={props.data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="hsl(var(--chart-2))" name="Income" radius={[4, 4, 0, 0]} />
          <Bar
            dataKey="expenses"
            fill="hsl(var(--chart-1))"
            name="Expenses"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const BudgetComparisonChartComponent: ComponentFn<CatalogType, 'BudgetComparisonChart'> = ({
  props,
}) => {
  const { navigateToCategory } = useChatNavigation();

  return (
    <Card className="w-full">
      {props.title && (
        <CardHeader>
          <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(200, props.data.length * 40)}>
          <BarChart data={props.data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis
              dataKey="label"
              type="category"
              width={120}
              className="text-xs"
              cursor="pointer"
              onClick={(_data, index) => {
                const item = props.data[index];
                if (item) {
                  navigateToCategory(item.label);
                }
              }}
            />
            <Tooltip />
            <Legend />
            <Bar dataKey="budgeted" fill="hsl(var(--muted))" name="Budget" radius={[0, 4, 4, 0]} />
            <Bar
              dataKey="actual"
              fill="hsl(var(--chart-1))"
              name="Actual"
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              onClick={(entry) => navigateToCategory(entry.label)}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const TransactionsTableComponent: ComponentFn<CatalogType, 'TransactionsTable'> = ({ props }) => {
  const { navigateToSearch } = useChatNavigation();

  return (
    <Card className="w-full">
      {props.title && (
        <CardHeader>
          <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {props.transactions.map((t, i) => (
              <TableRow
                key={i}
                className="cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => navigateToSearch(t.description)}
              >
                <TableCell className="text-xs">{t.date}</TableCell>
                <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {t.category}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    t.type === 'INCOME'
                      ? 'text-green-600'
                      : t.type === 'EXPENSE'
                        ? 'text-red-600'
                        : 'text-blue-600'
                  }`}
                >
                  {t.currency} {t.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      t.type === 'INCOME'
                        ? 'default'
                        : t.type === 'EXPENSE'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="text-xs"
                  >
                    {t.type}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const AccountsListComponent: ComponentFn<CatalogType, 'AccountsList'> = ({ props }) => {
  const { navigateToAccount } = useChatNavigation();

  return (
    <Card className="w-full">
      {props.title && (
        <CardHeader>
          <CardTitle className="text-sm font-medium">{props.title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {props.accounts.map((account, i) => (
            <button
              key={i}
              type="button"
              className="flex w-full items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors cursor-pointer text-left"
              onClick={() => navigateToAccount(account.name)}
            >
              <span className="font-medium">{account.name}</span>
              <span className="flex items-center gap-2">
                <span
                  className={`font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {account.currency} {account.balance.toFixed(2)}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const { registry } = defineRegistry(catalog, {
  components: {
    Text: TextComponent,
    SummaryCard: SummaryCardComponent,
    CategoryPieChart: CategoryPieChartComponent,
    BarChart: BarChartComponent,
    IncomeExpenseChart: IncomeExpenseChartComponent,
    BudgetComparisonChart: BudgetComparisonChartComponent,
    TransactionsTable: TransactionsTableComponent,
    AccountsList: AccountsListComponent,
  },
});
