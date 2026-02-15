'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ImportResult } from '../lib/db';
import { useFileImport } from '../hooks/use-file-import';

interface UploadZoneProps {
  onImportComplete?: (result: ImportResult) => void;
  className?: string;
}

export function UploadZone({ onImportComplete, className }: UploadZoneProps) {
  const { isImporting, onDrop } = useFileImport(onImportComplete);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
    disabled: isImporting,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 text-center transition-colors',
        isDragActive
          ? 'border-primary bg-muted'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50',
        isImporting && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <input {...getInputProps()} />
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <Upload className="size-6 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {isDragActive ? 'Drop the file here' : 'Drop your ExpenseWise export here'}
        </p>
        <p className="text-xs text-muted-foreground">Accepts .json export files from ExpenseWise</p>
      </div>
      <Button variant="outline" size="sm" disabled={isImporting}>
        {isImporting ? 'Importing...' : 'Browse Files'}
      </Button>
    </div>
  );
}
