'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useConversationContext, type ConversationState } from '../internals/ConversationContext';

/**
 * Container for the conversation header info (title and subtitle).
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationHeaderInfo = React.forwardRef(function ChatConversationHeaderInfo(
  props: ChatConversationHeaderInfo.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { children, ...elementProps } = props;
  const state: ChatConversationHeaderInfo.State = useConversationContext();

  return useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: [elementProps, { children }],
  });
});

export namespace ChatConversationHeaderInfo {
  export interface State extends ConversationState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
