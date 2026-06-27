'use client';
import * as React from 'react';

export interface MessageListInternalContextValue {
  setRootElement(node: HTMLDivElement | null): void;
  handleScroll(): void;
  scheduleResizeRestore(): void;
  registerRowElement(id: string, element: HTMLDivElement | null): void;
  itemIds: string[];
  renderItem(params: { id: string; index: number }): React.ReactNode;
  getItemKey(id: string, index: number): React.Key;
  statusAnnouncement: string;
  messageListLabel: string;
}

const MessageListInternalContext = React.createContext<MessageListInternalContextValue | undefined>(
  undefined,
);

export const MessageListInternalContextProvider = MessageListInternalContext.Provider;

export function useMessageListInternalContext(): MessageListInternalContextValue {
  const ctx = React.useContext(MessageListInternalContext);
  if (ctx === undefined) {
    throw new Error(
      'Base UI: useMessageListInternalContext must be used within a ChatMessageList.Root component.',
    );
  }
  return ctx;
}
