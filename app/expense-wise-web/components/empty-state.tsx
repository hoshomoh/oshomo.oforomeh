import * as React from 'react';
import { FileUp, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'No Data Yet',
  description = 'Upload your ExpenseWise export file to get started.',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 text-center min-h-[calc(100vh-8rem)]',
        className,
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <FileUp className="size-8 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action === undefined ? (
        <Button asChild>
          <Link href="/expense-wise-web">
            <Upload className="h-4 w-4 mr-2" />
            Upload Data
          </Link>
        </Button>
      ) : (
        action
      )}
    </div>
  );
}
