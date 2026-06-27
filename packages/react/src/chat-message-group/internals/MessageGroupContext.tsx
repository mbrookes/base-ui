'use client';
import * as React from 'react';
import type { ChatRole } from '../../chat/types/chat-entities';
import type { ChatVariant } from '../../chat/variant/ChatVariantContext';
import type { ChatDensity } from '../../chat/density/ChatDensityContext';
import type { ResolvedMessageAuthor } from '../../chat/internals/messageAuthor';

export interface MessageGroupState {
  first: boolean;
  firstInList: boolean;
  last: boolean;
  authorRole?: ChatRole;
  authorId?: string;
  ownMessage: boolean;
  variant: ChatVariant;
  density: ChatDensity;
}

export interface MessageGroupContextValue extends MessageGroupState {
  grouped: boolean;
  displayName: string | null;
  resolvedAuthor: ResolvedMessageAuthor | null;
}

const MessageGroupContext = React.createContext<MessageGroupContextValue | null>(null);

export const MessageGroupContextProvider = MessageGroupContext.Provider;

export function useMessageGroupContext(): MessageGroupContextValue | null {
  return React.useContext(MessageGroupContext);
}
