'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';

/**
 * A floating layer rendered above the message list, anchored to its bottom edge.
 * Pointer events pass through to the list below.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageListOverlay = React.forwardRef(function ChatMessageListOverlay(
  props: ChatMessageListOverlay.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { children, ...elementProps } = props;

  return useRenderElement('div', props, {
    ref: forwardedRef,
    state: {},
    props: [
      elementProps,
      {
        children,
        style: {
          position: 'absolute' as const,
          bottom: 0,
          left: 0,
          right: 0,
          pointerEvents: 'none' as const,
          ...elementProps.style,
        },
      },
    ],
  });
});

export namespace ChatMessageListOverlay {
  export type State = Record<string, never>;
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
