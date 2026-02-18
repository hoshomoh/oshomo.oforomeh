'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { PROVIDER_META } from '../../lib/constants';
import type { LLMConfig, LLMProvider } from '../../lib/types';
import { formatSize } from '../../lib/format';
import { useLLMConfigForm } from '../../hooks/use-llm-config-form';

type LLMConfigFormProps = {
  config: LLMConfig | undefined;
  onSave: (config: LLMConfig) => Promise<void>;
};

export function LLMConfigForm({ config, onSave }: LLMConfigFormProps) {
  const {
    provider,
    apiKey,
    setApiKey,
    model,
    setModel,
    ollamaBaseUrl,
    setOllamaBaseUrl,
    showApiKey,
    setShowApiKey,
    saving,
    ollamaModels,
    fetchingOllamaModels,
    providerMeta,
    handleProviderChange,
    handleSave,
    fetchOllamaModels,
  } = useLLMConfigForm({ config, onSave });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>AI Provider Configuration</CardTitle>
        <CardDescription>
          Configure an LLM provider to chat with your financial data. Your API key is stored locally
          in your browser and sent per-request to the provider.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Provider */}
        <div className="space-y-2">
          <Label htmlFor="provider">Provider</Label>
          <Select value={provider} onValueChange={(v) => handleProviderChange(v as LLMProvider)}>
            <SelectTrigger id="provider">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROVIDER_META).map(([key, meta]) => (
                <SelectItem key={key} value={key}>
                  {meta.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* API Key */}
        {providerMeta.requiresApiKey && (
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`Enter your ${providerMeta.label} API key`}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Ollama Local: Base URL + refresh button */}
        {provider === 'ollama' && (
          <div className="space-y-2">
            <Label htmlFor="ollamaUrl">Ollama Base URL</Label>
            <div className="flex gap-2">
              <Input
                id="ollamaUrl"
                value={ollamaBaseUrl}
                onChange={(e) => setOllamaBaseUrl(e.target.value)}
                placeholder="http://localhost:11434"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={fetchOllamaModels}
                disabled={fetchingOllamaModels}
                title="Fetch installed models"
              >
                {fetchingOllamaModels ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Ollama Cloud: fetch button (proxied server-side to avoid CORS) */}
        {provider === 'ollama-cloud' && (
          <div className="space-y-2">
            <Label>Cloud Models</Label>
            <Button
              type="button"
              variant="outline"
              onClick={fetchOllamaModels}
              disabled={fetchingOllamaModels}
            >
              {fetchingOllamaModels ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Fetch Cloud Models
            </Button>
          </div>
        )}

        {/* Model */}
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          {provider === 'ollama' || provider === 'ollama-cloud' ? (
            <>
              {ollamaModels.length > 0 ? (
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {ollamaModels.map((m) => (
                      <SelectItem key={m.name} value={m.name}>
                        {m.name}
                        {provider === 'ollama' && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({formatSize(m.size)}
                            {m.details.parameter_size ? `, ${m.details.parameter_size}` : ''})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : null}
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Enter model name (e.g. llama3.2, mistral)"
              />
              <p className="text-xs text-muted-foreground">
                {ollamaModels.length > 0
                  ? 'Select from installed models above or type a different model name.'
                  : 'Enter a model name or click the refresh button above to load installed models.'}
              </p>
            </>
          ) : (
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {providerMeta.models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Save */}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Save Configuration
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
