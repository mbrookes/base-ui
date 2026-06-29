'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useConversationListItemContext } from '../internals/ConversationListItemContext';
import type { ConversationListItemState } from '../internals/ConversationListItemContext';

/**
 * Container for the conversation item's text content (title and preview).
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationListItemContent = React.forwardRef(
  function ChatConversationListItemContent(
    props: ChatConversationListItemContent.Props,
    forwardedRef: React.ForwardedRef<HTMLDivElement>,
  ) {
    const { render, className, style, children, ...elementProps } = props;
    const state: ChatConversationListItemContent.State = useConversationListItemContext();

    return useRenderElement('div', props, {
      ref: forwardedRef,
      state,
      props: [elementProps, { children }],
    });
  },
);

export namespace ChatConversationListItemContent {
  export interface State extends ConversationListItemState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
