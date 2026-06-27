'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useConversationListItemContext } from '../internals/ConversationListItemContext';
import type { ConversationListItemState } from '../internals/ConversationListItemContext';

function formatUnreadCount(count: number): string | number {
  return count > 99 ? '99+' : count;
}

/**
 * Displays the unread message count badge for a conversation.
 * In compact variant, renders a dot when there are unread messages.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationListUnreadBadge = React.forwardRef(
  function ChatConversationListUnreadBadge(
    props: ChatConversationListUnreadBadge.Props,
    forwardedRef: React.ForwardedRef<HTMLSpanElement>,
  ) {
    const { children, ...elementProps } = props;
    const state: ChatConversationListUnreadBadge.State = useConversationListItemContext();
    const { conversation, unread, variant } = state;

    const unreadCount =
      conversation?.unreadCount != null && conversation.unreadCount > 0
        ? conversation.unreadCount
        : null;

    const badgeChildren =
      variant === 'compact'
        ? (children ?? (unreadCount != null ? formatUnreadCount(unreadCount) : ''))
        : (children ?? (unreadCount != null ? formatUnreadCount(unreadCount) : null));

    const element = useRenderElement('span', props, {
      ref: forwardedRef,
      state,
      props: [elementProps, { children: badgeChildren }],
    });

    if (variant === 'compact') {
      if (!unread) {
        return null;
      }
      return element;
    }

    if (!unreadCount) {
      return null;
    }

    return element;
  },
);

export namespace ChatConversationListUnreadBadge {
  export interface State extends ConversationListItemState {}
  export interface Props extends BaseUIComponentProps<'span', State> {}
}
