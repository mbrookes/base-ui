'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useConversationContext, type ConversationState } from '../internals/ConversationContext';

/**
 * The header area of the conversation pane.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationHeader = React.forwardRef(function ChatConversationHeader(
  props: ChatConversationHeader.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { children, ...elementProps } = props;
  const state: ChatConversationHeader.State = useConversationContext();

  return useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: [elementProps, { children }],
  });
});

export namespace ChatConversationHeader {
  export interface State extends ConversationState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
