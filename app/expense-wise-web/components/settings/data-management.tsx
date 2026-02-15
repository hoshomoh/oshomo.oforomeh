'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Trash2, Database, Loader2 } from 'lucide-react';
import { formatRelativeDate } from '../../lib/format';
import { useDataManagement } from '../../hooks/use-data-management';

type DataManagementProps = {
  onDataCleared: () => void;
};

export function DataManagement({ onDataCleared }: DataManagementProps) {
  const { metadata, counts, totalDocs, clearing, dialogOpen, setDialogOpen, handleClear } =
    useDataManagement(onDataCleared);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Management
        </CardTitle>
        <CardDescription>Manage your stored financial data.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-4">
        {metadata ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Documents</span>
              <span className="font-medium">{totalDocs}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transactions</span>
              <span className="font-medium">{counts.transaction ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accounts</span>
              <span className="font-medium">{counts.account ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budgets</span>
              <span className="font-medium">{counts.budget ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Groups</span>
              <span className="font-medium">{counts.group ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">App Version</span>
              <span className="font-medium">{metadata.appVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Imported</span>
              <span className="font-medium">{formatRelativeDate(metadata.lastImportedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backed Up At</span>
              <span className="font-medium">{formatRelativeDate(metadata.backedUpAt)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No data imported yet.</p>
        )}

        <div className="mt-auto">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full" disabled={totalDocs === 0}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear All Data</DialogTitle>
                <DialogDescription>
                  This will permanently delete all {totalDocs} documents from your browser storage.
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleClear} disabled={clearing}>
                  {clearing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    'Delete Everything'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
