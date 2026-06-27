'use client';
import * as React from 'react';
import type { ChatError } from '../../chat/types/chat-error';
import type { ChatDraftAttachment, ChatAttachmentsConfig } from '../../chat/types/chat-entities';

export interface ComposerState {
  submitting: boolean;
  hasValue: boolean;
  streaming: boolean;
  attachmentCount: number;
  disabled: boolean;
}

export interface ComposerContextValue extends ComposerState {
  value: string;
  setValue(value: string): void;
  submit(): Promise<void>;
  addAttachment(file: File): void;
  removeAttachment(localId: string): void;
  attachments: ChatDraftAttachment[];
  attachmentConfig?: ChatAttachmentsConfig;
  error: ChatError | null;
  setComposerIsComposing(value: boolean): void;
}

const ComposerContext = React.createContext<ComposerContextValue | undefined>(undefined);

export function ComposerContextProvider(props: {
  children: React.ReactNode;
  value: ComposerContextValue;
}) {
  const { children, value } = props;
  return <ComposerContext.Provider value={value}>{children}</ComposerContext.Provider>;
}

export function useComposerContext(): ComposerContextValue {
  const ctx = React.useContext(ComposerContext);
  if (ctx === undefined) {
    throw new Error('Base UI: useComposerContext must be used within a Chat.Composer component.');
  }
  return ctx;
}
