'use client';
import * as React from 'react';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useMessageListInternalContext } from '../internals/MessageListInternalContext';

/**
 * The scrollable viewport of the chat message list.
 * Bind your scroll container to this element.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageListViewport = React.forwardRef(function ChatMessageListViewport(
  props: ChatMessageListViewport.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { render, className, style, children, ...elementProps } = props;
  const { setRootElement, handleScroll, messageListLabel } = useMessageListInternalContext();

  const ref = useMergedRefs(forwardedRef, setRootElement);

  return useRenderElement('div', props, {
    ref,
    state: {},
    props: [
      elementProps,
      {
        role: 'log' as const,
        'aria-label': messageListLabel,
        onScroll: handleScroll,
        children,
        style: {
          overflowY: 'auto' as const,
          overscrollBehavior: 'contain' as const,
          ...style,
        },
      },
    ],
  });
});

export namespace ChatMessageListViewport {
  export type State = Record<string, never>;
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
