'use client';
import * as React from 'react';

export interface MessageListContextValue {
  isAtBottom: boolean;
  unseenMessageCount: number;
  scrollToBottom(options?: { behavior?: ScrollBehavior }): void;
}

const MessageListContext = React.createContext<MessageListContextValue | undefined>(undefined);

export function MessageListContextProvider(props: {
  children: React.ReactNode;
  value: MessageListContextValue;
}) {
  const { children, value } = props;

  return <MessageListContext.Provider value={value}>{children}</MessageListContext.Provider>;
}

export function useMessageListContext(): MessageListContextValue {
  const ctx = React.useContext(MessageListContext);
  if (ctx === undefined) {
    throw new Error(
      'Base UI: useMessageListContext must be used within a ChatMessageList.Root component.',
    );
  }
  return ctx;
}

export function useOptionalMessageListContext(): MessageListContextValue | undefined {
  return React.useContext(MessageListContext);
}
