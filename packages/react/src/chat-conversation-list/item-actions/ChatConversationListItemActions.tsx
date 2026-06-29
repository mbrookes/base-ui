'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useConversationListItemContext } from '../internals/ConversationListItemContext';
import type { ConversationListItemState } from '../internals/ConversationListItemContext';

/**
 * Container for action buttons in a conversation list item.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationListItemActions = React.forwardRef(
  function ChatConversationListItemActions(
    props: ChatConversationListItemActions.Props,
    forwardedRef: React.ForwardedRef<HTMLDivElement>,
  ) {
    const { render, className, style, children, ...elementProps } = props;
    const state: ChatConversationListItemActions.State = useConversationListItemContext();

    return useRenderElement('div', props, {
      ref: forwardedRef,
      state,
      props: [elementProps, { children }],
    });
  },
);

export namespace ChatConversationListItemActions {
  export interface State extends ConversationListItemState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
