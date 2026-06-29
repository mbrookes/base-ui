'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useConversationContext, type ConversationState } from '../internals/ConversationContext';

/**
 * Container for action buttons in the conversation header.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationHeaderActions = React.forwardRef(
  function ChatConversationHeaderActions(
    props: ChatConversationHeaderActions.Props,
    forwardedRef: React.ForwardedRef<HTMLDivElement>,
  ) {
    const { render, className, style, children, ...elementProps } = props;
    const state: ChatConversationHeaderActions.State = useConversationContext();

    return useRenderElement('div', props, {
      ref: forwardedRef,
      state,
      props: [elementProps, { children }],
    });
  },
);

export namespace ChatConversationHeaderActions {
  export interface State extends ConversationState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
