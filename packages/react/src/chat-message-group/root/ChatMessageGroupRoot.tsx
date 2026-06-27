'use client';
import * as React from 'react';
import { useStore } from '@base-ui/utils/store';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useChatStore } from '../../chat/hooks/useChatStore';
import { useMessage, useMessageIds } from '../../chat/hooks/useMessage';
import { useMessageAuthor } from '../../chat/hooks/useMessageAuthor';
import { getMessageWithResolvedAuthor } from '../../chat/internals/messageAuthor';
import { useChatVariant } from '../../chat/variant/ChatVariantContext';
import { useChatDensity } from '../../chat/density/ChatDensityContext';
import { chatSelectors } from '../../chat/selectors';
import type { ChatMessage } from '../../chat/types/chat-entities';
import {
  MessageGroupContextProvider,
  type MessageGroupState,
} from '../internals/MessageGroupContext';

/**
 * A function that maps a message to a group key.
 * Messages that resolve to the same key are visually grouped together.
 */
export type GroupKeyFn = (message: ChatMessage) => string | number;

const DEFAULT_GROUP_KEY: GroupKeyFn = (message) => message.author?.id ?? message.role ?? '';

/**
 * Creates a `groupKey` function that groups messages by author within a sliding
 * time window.
 */
export function createTimeWindowGroupKey(windowMs: number = 300_000): GroupKeyFn {
  return (message: ChatMessage) => {
    const timestamp = message.createdAt ? Date.parse(message.createdAt) : null;
    const bucket =
      timestamp != null && !Number.isNaN(timestamp) ? Math.floor(timestamp / windowMs) : 0;
    return `${message.author?.id ?? message.role ?? ''}-${bucket}`;
  };
}

function resolveMessageIndex(messageId: string, index: number | undefined, items: string[]) {
  if (index != null) {
    return index;
  }
  return items.indexOf(messageId);
}

const stateAttributesMapping = {
  firstInList: () => null,
  variant: () => null,
  density: () => null,
  resolvedAuthor: () => null,
  displayName: () => null,
  grouped: () => null,
  authorId: (v: string | undefined) => (v != null ? { 'data-author-id': v } : null),
  authorRole: (v: string | undefined) => (v != null ? { 'data-author-role': v } : null),
};

/**
 * Groups consecutive messages from the same author.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageGroupRoot = React.forwardRef(function ChatMessageGroupRoot(
  props: ChatMessageGroupRoot.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    children,
    messageId,
    index,
    items: itemsProp,
    groupKey = DEFAULT_GROUP_KEY,
    ...elementProps
  } = props;

  const defaultItems = useMessageIds();
  const items = itemsProp ?? defaultItems;
  const store = useChatStore();
  const activeConversation = useStore(store, chatSelectors.activeConversation);
  const messageIndex = resolveMessageIndex(messageId, index, items);
  const previousMessageId = messageIndex > 0 ? items[messageIndex - 1] : undefined;
  const nextMessageId =
    messageIndex >= 0 && messageIndex < items.length - 1 ? items[messageIndex + 1] : undefined;
  const message = useMessage(messageId);
  const resolvedAuthor = useMessageAuthor(messageId);
  const previousMessage = useMessage(previousMessageId ?? '');
  const nextMessage = useMessage(nextMessageId ?? '');
  const variant = useChatVariant();
  const density = useChatDensity();

  const resolveGroupKey = React.useCallback(
    (candidate: ChatMessage | null) => {
      if (!candidate) {
        return null;
      }
      const resolvedMessage = getMessageWithResolvedAuthor(candidate, {
        currentUser: store.parameters.currentUser,
        members: store.parameters.members,
        activeConversation: activeConversation ?? undefined,
        getMessageAuthorId: store.parameters.getMessageAuthorId,
        getMessageAuthorDisplayName: store.parameters.getMessageAuthorDisplayName,
        getMessageAuthorAvatarUrl: store.parameters.getMessageAuthorAvatarUrl,
      });
      return groupKey(resolvedMessage ?? candidate);
    },
    [activeConversation, groupKey, store.parameters],
  );

  const prevKey = resolveGroupKey(previousMessage);
  const currentKey = resolveGroupKey(message);
  const nextKey = resolveGroupKey(nextMessage);

  const isFirst = prevKey === null || prevKey !== currentKey;
  const isFirstInList = messageIndex === 0;
  const isLast = nextKey === null || nextKey !== currentKey;
  const isOwnMessage = (resolvedAuthor ?? null)?.isOwnMessage ?? message?.role === 'user' ?? false;
  const displayName = resolvedAuthor?.displayName ?? null;

  const state: ChatMessageGroupRoot.State = {
    first: isFirst,
    firstInList: isFirstInList,
    last: isLast,
    authorRole: message?.role,
    authorId: resolvedAuthor?.id,
    ownMessage: isOwnMessage,
    variant,
    density,
  };

  const contextValue = React.useMemo(
    () => ({
      ...state,
      grouped: !isFirst,
      displayName,
      resolvedAuthor: resolvedAuthor ?? null,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      isFirst,
      isFirstInList,
      isLast,
      isOwnMessage,
      message?.role,
      resolvedAuthor,
      displayName,
      variant,
      density,
    ],
  );

  return (
    <MessageGroupContextProvider value={contextValue}>
      {useRenderElement('div', props, {
        ref: forwardedRef,
        state,
        props: [elementProps, { children }],
        stateAttributesMapping,
      })}
    </MessageGroupContextProvider>
  );
});

export namespace ChatMessageGroupRoot {
  export interface State extends MessageGroupState {}

  export interface Props extends BaseUIComponentProps<'div', State> {
    messageId: string;
    index?: number;
    items?: string[];
    groupKey?: GroupKeyFn;
  }
}
