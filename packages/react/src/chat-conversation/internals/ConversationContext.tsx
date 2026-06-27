'use client';
import * as React from 'react';
import type { ChatConversation } from '../../chat/types/chat-entities';

export interface ConversationState {
  conversationId?: string;
  hasConversation: boolean;
  conversation: ChatConversation | null;
}

const ConversationContext = React.createContext<ConversationState | undefined>(undefined);

export function ConversationContextProvider(props: {
  children: React.ReactNode;
  value: ConversationState;
}) {
  const { children, value } = props;
  return <ConversationContext.Provider value={value}>{children}</ConversationContext.Provider>;
}

export function useConversationContext(): ConversationState {
  const ctx = React.useContext(ConversationContext);
  if (ctx === undefined) {
    throw new Error(
      'Base UI: useConversationContext must be used within a ChatConversation.Root component.',
    );
  }
  return ctx;
}
