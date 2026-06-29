'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import { BaseUIComponentProps } from '../../internals/types';
import type { ChatMessage } from '../types/chat-entities';
import {
  useStreamingIndicatorVisibility,
  type StreamingIndicatorMode,
} from '../hooks/useStreamingIndicatorVisibility';
import { useOptionalMessageContext } from '../../chat-message/internals/MessageContext';

export interface StreamingIndicatorState {
  phase: 'streaming' | 'waiting' | null;
  messageId: string | undefined;
}

const stateAttributesMapping = {
  phase: (v: StreamingIndicatorState['phase']) => (v ? { [`data-phase-${v}`]: '' } : null),
  messageId: () => null,
};

/**
 * Animated "response in flight" indicator.
 * Outside a message it covers the waiting phase (request sent, no assistant message yet);
 * inside a message it renders while that assistant message is streaming.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const StreamingIndicator = React.forwardRef(function StreamingIndicator(
  props: StreamingIndicator.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    render,
    className,
    style,
    mode = 'auto',
    message: messageProp,
    messageId,
    index,
    items,
    children,
    ...elementProps
  } = props;

  const messageContext = useOptionalMessageContext();
  const message = messageProp !== undefined ? messageProp : (messageContext?.message ?? null);
  const { waiting } = useStreamingIndicatorVisibility(mode);

  let phase: StreamingIndicatorState['phase'] = null;
  if (message != null) {
    if (message.role === 'assistant' && message.status === 'streaming' && mode !== false) {
      phase = 'streaming';
    }
  } else if (waiting) {
    phase = 'waiting';
  }

  const state: StreamingIndicator.State = {
    phase,
    messageId: message?.id ?? messageId,
  };

  const element = useRenderElement('div', props, {
    state,
    ref: forwardedRef,
    props: {
      ...elementProps,
      'aria-hidden': true as unknown as undefined,
      children: children ?? (
        <React.Fragment>
          <span />
          <span />
          <span />
        </React.Fragment>
      ),
    },
    stateAttributesMapping,
  });

  if (items != null && index != null && index !== items.length - 1) {
    return null;
  }

  if (phase == null) {
    return null;
  }

  return element;
});

export namespace StreamingIndicator {
  export interface State {
    phase: 'streaming' | 'waiting' | null;
    messageId: string | undefined;
  }

  export interface Props extends BaseUIComponentProps<'div', State> {
    mode?: StreamingIndicatorMode | undefined;
    message?: ChatMessage | null | undefined;
    messageId?: string | undefined;
    index?: number | undefined;
    items?: string[] | undefined;
  }
}
