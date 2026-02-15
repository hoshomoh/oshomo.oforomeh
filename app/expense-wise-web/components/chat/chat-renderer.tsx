'use client';

import type { ReactNode } from 'react';
import {
  Renderer,
  type Spec,
  StateProvider,
  VisibilityProvider,
  ActionProvider,
} from '@json-render/react';
import { registry } from '../../lib/chat/registry';

type ChatRendererProps = {
  spec: Spec | null;
  loading?: boolean;
};

export function ChatRenderer({ spec, loading }: ChatRendererProps): ReactNode {
  if (!spec) {
    return null;
  }

  return (
    <StateProvider initialState={spec.state ?? {}}>
      <VisibilityProvider>
        <ActionProvider>
          <Renderer spec={spec} registry={registry} loading={loading} />
        </ActionProvider>
      </VisibilityProvider>
    </StateProvider>
  );
}
