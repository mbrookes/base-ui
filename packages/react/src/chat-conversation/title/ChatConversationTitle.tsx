'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useConversationContext, type ConversationState } from '../internals/ConversationContext';

/**
 * Displays the active conversation's title.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationTitle = React.forwardRef(function ChatConversationTitle(
  props: ChatConversationTitle.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { children, ...elementProps } = props;
  const state: ChatConversationTitle.State = useConversationContext();

  return useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: [elementProps, { children: children ?? state.conversation?.title ?? null }],
  });
});

export namespace ChatConversationTitle {
  export interface State extends ConversationState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
