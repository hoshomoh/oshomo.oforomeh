'use client';

import * as React from 'react';
import type { UIMessage } from 'ai';
import { saveChatMessages, getChatMessages, clearChatMessages } from '../lib/db';

/**
 * Handles loading, saving, and clearing chat messages from IndexedDB.
 *
 * - Loads persisted messages on mount and exposes them as `initialMessages`.
 * - `loaded` flips to `true` once the initial read completes.
 * - `saveMessages` persists the current message list (call when messages change).
 * - `clearMessages` wipes persisted messages from storage.
 */
export function usePersistedChat() {
  const [initialMessages, setInitialMessages] = React.useState<UIMessage[] | undefined>(undefined);
  const [loaded, setLoaded] = React.useState(false);

  // Load persisted messages on mount
  React.useEffect(() => {
    getChatMessages().then((stored) => {
      if (stored.length > 0) {
        setInitialMessages(stored as UIMessage[]);
      }
      setLoaded(true);
    });
  }, []);

  const saveMessages = React.useCallback(
    (messages: UIMessage[], status: string) => {
      if (loaded && messages.length > 0 && status === 'ready') {
        saveChatMessages(messages);
      }
    },
    [loaded],
  );

  const clearMessages = React.useCallback(() => {
    clearChatMessages();
  }, []);

  return { initialMessages, loaded, saveMessages, clearMessages };
}
