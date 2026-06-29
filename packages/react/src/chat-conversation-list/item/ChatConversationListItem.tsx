'use client';
import * as React from 'react';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useStore } from '@base-ui/utils/store';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useChatStore } from '../../chat/hooks/useChatStore';
import { chatSelectors } from '../../chat/selectors';
import { useConversationListRootContext } from '../internals/ConversationListContext';
import {
  ConversationListItemContextProvider,
  type ConversationListItemState,
} from '../internals/ConversationListItemContext';
import type { ConversationListVariant } from '../internals/conversationListTypes';

const stateAttributesMapping = {
  conversationId: (v: string) => ({ 'data-conversation-id': v }),
  conversation: () => null,
  variant: () => null,
};

/**
 * A single conversation item in the conversation list.
 * Renders a `<div>` element with `role="option"`.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationListItem = React.forwardRef(function ChatConversationListItem(
  props: ChatConversationListItem.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    render,
    className,
    style,
    children,
    conversationId,
    variant = 'default',
    ...elementProps
  } = props;
  const store = useChatStore();
  const conversation = useStore(store, chatSelectors.conversation, conversationId) ?? null;
  const {
    activeConversationId,
    focusedConversationId,
    registerItemRef,
    onItemFocus,
    onItemSelect,
    onItemKeyDown,
  } = useConversationListRootContext();

  const selected = activeConversationId === conversationId;
  const focused = focusedConversationId === conversationId;
  const unread =
    (conversation?.unreadCount != null && conversation.unreadCount > 0) ||
    conversation?.readState === 'unread';

  const handleRef = useMergedRefs(
    forwardedRef,
    React.useCallback(
      (element: HTMLDivElement | null) => {
        registerItemRef(conversationId, element);
      },
      [conversationId, registerItemRef],
    ),
  );

  const state: ChatConversationListItem.State = {
    conversationId,
    conversation,
    selected,
    unread,
    focused,
    variant,
  };

  const itemContextValue = React.useMemo<ConversationListItemState>(
    () => state,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [conversationId, conversation, selected, unread, focused, variant],
  );

  return (
    <ConversationListItemContextProvider value={itemContextValue}>
      {useRenderElement('div', props, {
        ref: handleRef,
        state,
        props: [
          elementProps,
          {
            tabIndex: focused ? 0 : -1,
            'aria-current': selected ? (true as const) : undefined,
            children,
            onClick: () => onItemSelect(conversationId),
            onFocus: () => onItemFocus(conversationId),
            onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) =>
              onItemKeyDown(event, conversationId),
          },
        ],
        stateAttributesMapping,
      })}
    </ConversationListItemContextProvider>
  );
});

export namespace ChatConversationListItem {
  export interface State extends ConversationListItemState {}

  export interface Props extends BaseUIComponentProps<'div', State> {
    conversationId: string;
    variant?: ConversationListVariant | undefined;
  }
}
