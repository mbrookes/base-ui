'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useConversationListItemContext } from '../internals/ConversationListItemContext';
import type { ConversationListItemState } from '../internals/ConversationListItemContext';

/**
 * Displays the conversation title.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationListTitle = React.forwardRef(function ChatConversationListTitle(
  props: ChatConversationListTitle.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { children, ...elementProps } = props;
  const state: ChatConversationListTitle.State = useConversationListItemContext();

  return useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: [
      elementProps,
      { children: children ?? state.conversation?.title ?? state.conversationId },
    ],
  });
});

export namespace ChatConversationListTitle {
  export interface State extends ConversationListItemState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
