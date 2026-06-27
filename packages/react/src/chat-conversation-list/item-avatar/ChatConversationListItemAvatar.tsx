'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useConversationListItemContext } from '../internals/ConversationListItemContext';
import type { ConversationListItemState } from '../internals/ConversationListItemContext';

/**
 * Displays the conversation's avatar image.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationListItemAvatar = React.forwardRef(
  function ChatConversationListItemAvatar(
    props: ChatConversationListItemAvatar.Props,
    forwardedRef: React.ForwardedRef<HTMLDivElement>,
  ) {
    const { children, ...elementProps } = props;
    const { conversation } = useConversationListItemContext();
    const state: ChatConversationListItemAvatar.State = useConversationListItemContext();

    const participant =
      conversation?.participants?.find((p) => p.role !== 'user') ?? conversation?.participants?.[0];
    const avatarUrl = conversation?.avatarUrl ?? participant?.avatarUrl;
    const avatarAlt = participant?.displayName ?? '';

    return useRenderElement('div', props, {
      ref: forwardedRef,
      state,
      props: [
        elementProps,
        {
          children: children ?? (avatarUrl ? <img alt={avatarAlt} src={avatarUrl} /> : null),
        },
      ],
    });
  },
);

export namespace ChatConversationListItemAvatar {
  export interface State extends ConversationListItemState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
