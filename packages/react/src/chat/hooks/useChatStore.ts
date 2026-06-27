'use client';
import type { ChatStore } from '../store';
import { useChatStoreContext } from '../internals/useChatStoreContext';

export function useChatStore<Cursor = string>(): ChatStore<Cursor> {
  const store = useChatStoreContext<Cursor>(true);

  if (store == null) {
    throw new Error('Base UI: useChatStore must be used within a <Chat.Root> component.');
  }

  return store;
}
