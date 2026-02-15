import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getCategoryMeta } from '../lib/constants';

interface CategoryBadgeProps {
  categoryId: string;
  className?: string;
}

export function CategoryBadge({ categoryId, className }: CategoryBadgeProps) {
  const meta = getCategoryMeta(categoryId);
  const Icon = meta.icon;

  return (
    <Badge
      variant="secondary"
      className={cn('gap-1.5', className)}
      style={{ borderLeft: `3px solid ${meta.color}` }}
    >
      <span
        className="inline-flex size-2 shrink-0 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      <Icon className="size-3" />
      <span>{meta.label}</span>
    </Badge>
  );
}
