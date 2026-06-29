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
 * Renders the author's display name for a chat message.
 * Only shown in `compact` variant for the first message in a group.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageAuthorLabel = React.forwardRef(function ChatMessageAuthorLabel(
  props: ChatMessageAuthorLabel.Props,
  forwardedRef: React.ForwardedRef<HTMLSpanElement>,
) {
  const { render, className, style, children, ...elementProps } = props;
  const ctx = useMessageContext();
  const state: ChatMessageAuthorLabel.State = ctx;
  const authorLabel = ctx.resolvedAuthor?.displayName;

  const element = useRenderElement('span', props, {
    ref: forwardedRef,
    state,
    props: {
      ...elementProps,
      children: children ?? authorLabel,
    },
    stateAttributesMapping,
  });

  if (ctx.variant !== 'compact' || ctx.grouped) {
    return null;
  }
  if (!authorLabel && !children) {
    return null;
  }

  return element;
});

export namespace ChatMessageAuthorLabel {
  export interface State extends MessageState {}
  export interface Props extends BaseUIComponentProps<'span', State> {}
}
