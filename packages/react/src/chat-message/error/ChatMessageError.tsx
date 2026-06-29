'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useMessageError } from '../../chat/hooks/useMessageError';
import { useChatRuntimeContext } from '../../chat/internals/useChatRuntimeContext';
import { useMessageContext, type MessageState } from '../internals/MessageContext';
import type { ChatError } from '../../chat/types/chat-error';

const stateAttributesMapping = {
  messageId: () => null,
  message: () => null,
  resolvedAuthor: () => null,
  showAvatar: (v: boolean) => (v ? { 'data-show-avatar': '' } : null),
  grouped: (v: boolean) => (v ? { 'data-grouped': '' } : null),
  ownMessage: (v: boolean) => (v ? { 'data-own-message': '' } : null),
  chatError: () => null,
  retryable: (v: boolean) => (v ? { 'data-retryable': '' } : null),
};

/**
 * Renders an error message for the current message.
 * Returns `null` when there is no error.
 * Renders a `<div>` element with `role="alert"`.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageError = React.forwardRef(function ChatMessageError(
  props: ChatMessageError.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { render, className, style, children, ...elementProps } = props;
  const messageContext = useMessageContext();
  const { messageId } = messageContext;
  const chatError = useMessageError(messageId);
  const runtime = useChatRuntimeContext(true);

  const retry = React.useCallback(async () => {
    if (!runtime || !messageId) {
      return;
    }
    await runtime.actions.retry(messageId);
  }, [runtime, messageId]);

  const state: ChatMessageError.State = {
    ...messageContext,
    chatError,
    retryable: (chatError?.retryable ?? false) && messageContext.role === 'user',
    retry,
  };

  const element = useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: {
      ...elementProps,
      role: 'alert',
      children: children ?? chatError?.message,
    },
    stateAttributesMapping,
  });

  if (!chatError) {
    return null;
  }

  return element;
});

export namespace ChatMessageError {
  export interface State extends MessageState {
    chatError: ChatError | null;
    retryable: boolean;
    retry: () => Promise<void> | void;
  }

  export interface Props extends BaseUIComponentProps<'div', State> {}
}
