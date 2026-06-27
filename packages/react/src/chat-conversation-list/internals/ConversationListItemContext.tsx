'use client';
import * as React from 'react';
import type { ChatConversation } from '../../chat/types/chat-entities';
import type { ConversationListVariant } from './conversationListTypes';

export interface ConversationListItemState {
  conversationId: string;
  conversation: ChatConversation | null;
  selected: boolean;
  unread: boolean;
  focused: boolean;
  variant: ConversationListVariant;
}

const ConversationListItemContext = React.createContext<ConversationListItemState | undefined>(
  undefined,
);

export const ConversationListItemContextProvider = ConversationListItemContext.Provider;

export function useConversationListItemContext(): ConversationListItemState {
  const ctx = React.useContext(ConversationListItemContext);
  if (ctx === undefined) {
    throw new Error(
      'Base UI: useConversationListItemContext must be used within a ChatConversationList.Item component.',
    );
  }
  return ctx;
}
