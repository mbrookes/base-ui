'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { useMessageContext, type MessageState } from '../internals/MessageContext';

const stateAttributesMapping = {
  messageId: () => null,
  message: () => null,
  resolvedAuthor: () => null,
  showAvatar: (v: boolean) => (v ? { 'data-show-avatar': '' } : null),
  grouped: (v: boolean) => (v ? { 'data-grouped': '' } : null),
  ownMessage: (v: boolean) => (v ? { 'data-own-message': '' } : null),
};

/**
 * A container for message action buttons.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageActions = React.forwardRef(function ChatMessageActions(
  props: ChatMessageActions.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { ...elementProps } = props;
  const state: ChatMessageActions.State = useMessageContext();
  const localeText = useChatLocaleText();

  return useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: [
      elementProps,
      {
        role: 'toolbar' as const,
        'aria-label': localeText.messageActionsLabel,
      },
    ],
    stateAttributesMapping,
  });
});

export namespace ChatMessageActions {
  export interface State extends MessageState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
