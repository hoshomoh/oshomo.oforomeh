import { cn } from '@/lib/utils';
import { formatCurrency } from '../lib/format';

interface CurrencyDisplayProps {
  amount: number;
  currency: string;
  className?: string;
  showSign?: boolean;
}

export function CurrencyDisplay({
  amount,
  currency,
  className,
  showSign = false,
}: CurrencyDisplayProps) {
  const formatted = formatCurrency(amount, currency);
  const isPositive = amount > 0;
  const isNegative = amount < 0;

  const display = showSign && isPositive ? `+${formatted}` : formatted;

  return (
    <span
      className={cn(
        'tabular-nums',
        isPositive && 'text-green-600',
        isNegative && 'text-red-600',
        className,
      )}
    >
      {display}
    </span>
  );
}
