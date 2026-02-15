'use client';

import * as React from 'react';
import { useData } from '../context/data-context';
import { useSettings } from '../hooks/use-settings';
import { PageHeader } from '../components/page-header';
import { LLMConfigForm } from '../components/settings/llm-config-form';
import { DataManagement } from '../components/settings/data-management';
import { UploadZone } from '../components/upload-zone';

export default function SettingsPage() {
  const { refetch } = useData();
  const { config, saveConfig } = useSettings();

  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Settings" description="Configure your AI provider and manage data" />

      <UploadZone onImportComplete={() => refetch()} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <LLMConfigForm key={config?.provider ?? 'none'} config={config} onSave={saveConfig} />
        <DataManagement onDataCleared={refetch} />
      </div>
    </div>
  );
}
