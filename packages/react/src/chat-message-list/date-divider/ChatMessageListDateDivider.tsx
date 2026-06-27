'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useIsHydrated } from '../../chat/internals/useIsHydrated';
import { useMessage, useMessageIds } from '../../chat/hooks/useMessage';
import type { ChatMessage } from '../../chat/types/chat-entities';

export interface MessageListDateDividerState {
  messageId: string;
  hasBoundary: boolean;
  label: React.ReactNode;
}

const stateAttributesMapping = {
  messageId: () => null,
  label: () => null,
  hasBoundary: (v: boolean) => (v ? { 'data-has-boundary': '' } : null),
};

function resolveMessageIndex(messageId: string, index: number | undefined, items: string[]) {
  if (index != null) return index;
  return items.indexOf(messageId);
}

function parseDate(value: string | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatIsoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatLocalDate(date: Date) {
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function isSameCalendarDay(left: Date, right: Date) {
  return formatIsoDay(left) === formatIsoDay(right);
}

/**
 * A date separator rendered between messages that span a calendar day boundary.
 * Returns `null` when there is no boundary for the current message.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageListDateDivider = React.forwardRef(function ChatMessageListDateDivider(
  props: ChatMessageListDateDivider.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    messageId,
    index,
    items: itemsProp,
    formatDate,
    shouldShowDivider,
    ...elementProps
  } = props;

  const defaultItems = useMessageIds();
  const items = itemsProp ?? defaultItems;
  const messageIndex = resolveMessageIndex(messageId, index, items);
  const previousMessageId = messageIndex > 0 ? items[messageIndex - 1] : undefined;
  const message = useMessage(messageId);
  const previousMessage = useMessage(previousMessageId ?? '');
  const currentDate = parseDate(message?.createdAt);
  const previousDate = parseDate(previousMessage?.createdAt);
  const isHydrated = useIsHydrated();

  const hasBoundary =
    shouldShowDivider != null && message != null
      ? shouldShowDivider({
          message,
          previousMessage,
          index: messageIndex,
          date: currentDate,
          previousDate,
        })
      : messageIndex > 0 &&
        currentDate != null &&
        previousDate != null &&
        !isSameCalendarDay(previousDate, currentDate);

  const label =
    isHydrated && currentDate ? (formatDate?.(currentDate) ?? formatLocalDate(currentDate)) : null;

  const state: ChatMessageListDateDivider.State = {
    messageId,
    hasBoundary,
    label,
  };

  const element = useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: {
      ...elementProps,
      role: 'separator',
      children: (
        <React.Fragment>
          <div />
          <div>{label}</div>
          <div />
        </React.Fragment>
      ),
    },
    stateAttributesMapping,
  });

  if (!hasBoundary) return null;

  return element;
});

export namespace ChatMessageListDateDivider {
  export interface State {
    messageId: string;
    hasBoundary: boolean;
    label: React.ReactNode;
  }

  export interface Props extends Omit<BaseUIComponentProps<'div', State>, 'children'> {
    messageId: string;
    index?: number;
    items?: string[];
    formatDate?: (date: Date) => React.ReactNode;
    shouldShowDivider?: (params: {
      message: ChatMessage;
      previousMessage: ChatMessage | null;
      index: number;
      date: Date | null;
      previousDate: Date | null;
    }) => boolean;
  }
}
