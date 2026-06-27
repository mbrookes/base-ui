'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useConversationListItemContext } from '../internals/ConversationListItemContext';
import type { ConversationListItemState } from '../internals/ConversationListItemContext';

/**
 * Displays the conversation's preview text (subtitle of the last message).
 * Renders nothing if there is no preview available.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationListPreview = React.forwardRef(function ChatConversationListPreview(
  props: ChatConversationListPreview.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { children, ...elementProps } = props;
  const state: ChatConversationListPreview.State = useConversationListItemContext();
  const preview = state.conversation?.subtitle;

  const element = useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: [elementProps, { children: children ?? preview }],
  });

  if (!preview && !children) {
    return null;
  }

  return element;
});

export namespace ChatConversationListPreview {
  export interface State extends ConversationListItemState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
