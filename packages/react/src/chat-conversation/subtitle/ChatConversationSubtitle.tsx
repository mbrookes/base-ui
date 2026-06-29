'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useConversationContext, type ConversationState } from '../internals/ConversationContext';

/**
 * Displays the active conversation's subtitle.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationSubtitle = React.forwardRef(function ChatConversationSubtitle(
  props: ChatConversationSubtitle.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { render, className, style, children, ...elementProps } = props;
  const state: ChatConversationSubtitle.State = useConversationContext();

  return useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: [elementProps, { children: children ?? state.conversation?.subtitle ?? null }],
  });
});

export namespace ChatConversationSubtitle {
  export interface State extends ConversationState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
