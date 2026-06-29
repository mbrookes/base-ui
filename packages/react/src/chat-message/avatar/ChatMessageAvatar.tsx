'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
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
 * Renders the author's avatar for a chat message.
 * Returns `null` for system messages, grouped messages, or when no avatar is available.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageAvatar = React.forwardRef(function ChatMessageAvatar(
  props: ChatMessageAvatar.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { children, ...elementProps } = props;
  const ctx = useMessageContext();
  const avatarUrl = ctx.resolvedAuthor?.avatarUrl;

  const state: ChatMessageAvatar.State = ctx;

  const element = useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: {
      ...elementProps,
      children: children ?? (avatarUrl ? <img alt="" src={avatarUrl} /> : null),
    },
    stateAttributesMapping,
  });

  if (ctx.role === 'system' || ctx.message == null) {
    return null;
  }
  if (ctx.grouped) {
    return null;
  }
  if (avatarUrl == null && children == null) {
    return null;
  }

  return element;
});

export namespace ChatMessageAvatar {
  export interface State extends MessageState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
