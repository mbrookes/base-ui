'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useMessageListInternalContext } from '../internals/MessageListInternalContext';

// Visually-hidden but present in the accessibility tree (status live region
// must stay rendered to announce streaming transitions).
const visuallyHiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * A visually-hidden `role="status"` live region that announces streaming
 * transitions ("Assistant is responding" / "Response complete") to screen readers.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageListStatus = React.forwardRef(function ChatMessageListStatus(
  props: ChatMessageListStatus.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { ...elementProps } = props;
  const { statusAnnouncement } = useMessageListInternalContext();

  return useRenderElement('div', props, {
    ref: forwardedRef,
    state: {},
    props: [
      elementProps,
      {
        role: 'status' as const,
        style: { ...visuallyHiddenStyle, ...elementProps.style },
        children: statusAnnouncement,
      },
    ],
  });
});

export namespace ChatMessageListStatus {
  export type State = Record<string, never>;
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
