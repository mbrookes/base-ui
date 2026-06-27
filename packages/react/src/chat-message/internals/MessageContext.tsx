'use client';
import * as React from 'react';
import type { ChatMessage, ChatMessageStatus, ChatRole } from '../../chat/types/chat-entities';
import type { ChatVariant } from '../../chat/variant/ChatVariantContext';
import type { ChatDensity } from '../../chat/density/ChatDensityContext';
import type { ResolvedMessageAuthor } from '../../chat/internals/messageAuthor';

export interface MessageState {
  messageId: string;
  message: ChatMessage | null;
  role?: ChatRole;
  status?: ChatMessageStatus;
  streaming: boolean;
  error: boolean;
  grouped: boolean;
  variant: ChatVariant;
  density: ChatDensity;
  resolvedAuthor: ResolvedMessageAuthor | null;
  showAvatar: boolean;
  ownMessage: boolean;
}

const MessageContext = React.createContext<MessageState | undefined>(undefined);

export function MessageContextProvider(props: { children: React.ReactNode; value: MessageState }) {
  const { children, value } = props;
  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
}

export function useMessageContext(): MessageState {
  const ctx = React.useContext(MessageContext);
  if (ctx === undefined) {
    throw new Error('Base UI: useMessageContext must be used within a ChatMessage.Root component.');
  }
  return ctx;
}

export function useOptionalMessageContext(): MessageState | undefined {
  return React.useContext(MessageContext);
}
