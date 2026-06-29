'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import { BaseUIComponentProps } from '../../internals/types';
import { useChat } from '../hooks/useChat';
import { useMessageIds } from '../hooks/useMessage';
import { useChatLocaleText } from '../locales/ChatLocaleContext';

export interface UnreadMarkerState {
  messageId: string;
  hasBoundary: boolean;
  label: React.ReactNode;
}

const stateAttributesMapping = {
  hasBoundary: (v: boolean) => (v ? { 'data-has-boundary': '' } : null),
  messageId: () => null,
  label: () => null,
};

function resolveMessageIndex(messageId: string, index: number | undefined, items: string[]) {
  if (index != null) {
    return index;
  }
  return items.indexOf(messageId);
}

/**
 * Renders a visual separator at the point where unread messages begin.
 * Returns `null` when there is no unread boundary for the current message.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const UnreadMarker = React.forwardRef(function UnreadMarker(
  props: UnreadMarker.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { messageId, index, items: itemsProp, label: labelProp, ...elementProps } = props;
  const localeText = useChatLocaleText();
  const label = labelProp ?? localeText.unreadMarkerLabel;
  const defaultItems = useMessageIds();
  const { activeConversationId, conversations } = useChat();
  const items = itemsProp ?? defaultItems;
  const messageIndex = resolveMessageIndex(messageId, index, items);

  const activeConversation = React.useMemo(
    () =>
      activeConversationId == null
        ? null
        : (conversations.find((candidate) => candidate.id === activeConversationId) ?? null),
    [activeConversationId, conversations],
  );

  const boundaryIndex = React.useMemo(() => {
    if (!activeConversation || items.length === 0) {
      return -1;
    }
    if (activeConversation.unreadCount != null && activeConversation.unreadCount > 0) {
      return Math.max(0, items.length - activeConversation.unreadCount);
    }
    if (activeConversation.readState === 'unread') {
      return 0;
    }
    return -1;
  }, [activeConversation, items.length]);

  const hasBoundary = boundaryIndex >= 0 && boundaryIndex === messageIndex;

  const state: UnreadMarker.State = {
    messageId,
    hasBoundary,
    label,
  };

  const element = useRenderElement('div', props, {
    state,
    ref: forwardedRef,
    props: {
      ...elementProps,
      role: 'separator',
      children: <div>{label}</div>,
    },
    stateAttributesMapping,
  });

  if (!hasBoundary) {
    return null;
  }

  return element;
});

export namespace UnreadMarker {
  export interface State {
    messageId: string;
    hasBoundary: boolean;
    label: React.ReactNode;
  }

  export interface Props extends Omit<BaseUIComponentProps<'div', State>, 'children'> {
    messageId: string;
    index?: number | undefined;
    items?: string[] | undefined;
    label?: React.ReactNode;
  }
}
