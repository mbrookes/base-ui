'use client';
import * as React from 'react';

export interface ConversationListRootContextValue {
  activeConversationId?: string | undefined;
  focusedConversationId?: string | undefined;
  registerItemRef(id: string, element: HTMLElement | null): void;
  onItemFocus(id: string): void;
  onItemSelect(id: string): void;
  onItemKeyDown(event: React.KeyboardEvent<HTMLElement>, id: string): void;
}

const ConversationListRootContext = React.createContext<
  ConversationListRootContextValue | undefined
>(undefined);

export const ConversationListRootContextProvider = ConversationListRootContext.Provider;

export function useConversationListRootContext(): ConversationListRootContextValue {
  const ctx = React.useContext(ConversationListRootContext);
  if (ctx === undefined) {
    throw new Error(
      'Base UI: useConversationListRootContext must be used within a ChatConversationList.Root component.',
    );
  }
  return ctx;
}
