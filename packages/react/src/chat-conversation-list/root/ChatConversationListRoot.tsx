'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useChat } from '../../chat/hooks/useChat';
import { useChatStore } from '../../chat/hooks/useChatStore';
import { useConversations } from '../../chat/hooks/useConversation';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { markChatLayoutPane } from '../../chat/layout/chatLayoutPaneKind';
import { useRovingFocus } from '../../chat/internals/useRovingFocus';
import type { ConversationListVariant } from '../internals/conversationListTypes';
import {
  ConversationListRootContextProvider,
  type ConversationListRootContextValue,
} from '../internals/ConversationListContext';

export type { ConversationListVariant };

/**
 * The root of the conversation list.
 * Renders a `<nav>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationListRoot = markChatLayoutPane(
  React.forwardRef(function ChatConversationListRoot(
    props: ChatConversationListRoot.Props,
    forwardedRef: React.ForwardedRef<HTMLElement>,
  ) {
    const { render, className, style, children, variant = 'default', ...elementProps } = props;
    const conversations = useConversations();
    const { activeConversationId, setActiveConversation } = useChat();
    const store = useChatStore();
    const localeText = useChatLocaleText();

    const conversationIds = React.useMemo(() => conversations.map((c) => c.id), [conversations]);

    const titleById = React.useMemo(
      () => new Map(conversations.map((c) => [c.id, c.title])),
      [conversations],
    );

    const getTypeAheadLabel = React.useCallback(
      (id: string) => titleById.get(id) ?? undefined,
      [titleById],
    );

    const handleActivate = React.useCallback(
      (id: string) => {
        void setActiveConversation(id);
      },
      [setActiveConversation],
    );

    const {
      effectiveFocusedId: focusedConversationId,
      registerItemRef,
      setFocusedId,
      handleKeyDown,
    } = useRovingFocus({
      itemIds: conversationIds,
      restoreKey: store,
      scope: 'conversation-list',
      preferredId: activeConversationId,
      onActivate: handleActivate,
      getTypeAheadLabel,
      restoreFocusOnMount: true,
    });

    const handleSelect = React.useCallback(
      (id: string) => {
        setFocusedId(id);
        void setActiveConversation(id);
      },
      [setFocusedId, setActiveConversation],
    );

    const state: ChatConversationListRoot.State = {
      conversationCount: conversations.length,
      activeConversationId,
      variant,
    };

    const rootContextValue = React.useMemo<ConversationListRootContextValue>(
      () => ({
        activeConversationId,
        focusedConversationId,
        registerItemRef,
        onItemFocus: setFocusedId,
        onItemSelect: handleSelect,
        onItemKeyDown: handleKeyDown,
      }),
      [
        activeConversationId,
        focusedConversationId,
        registerItemRef,
        setFocusedId,
        handleSelect,
        handleKeyDown,
      ],
    );

    return (
      <ConversationListRootContextProvider value={rootContextValue}>
        {useRenderElement('nav', props, {
          ref: forwardedRef as React.ForwardedRef<HTMLDivElement>,
          state,
          props: [
            elementProps,
            {
              'aria-label': localeText.conversationListLandmarkLabel,
              children,
            },
          ],
        })}
      </ConversationListRootContextProvider>
    );
  }),
  'conversations',
);

export namespace ChatConversationListRoot {
  export interface State {
    conversationCount: number;
    activeConversationId?: string | undefined;
    variant: ConversationListVariant;
  }

  export interface Props extends BaseUIComponentProps<'nav', State> {
    /**
     * The visual variant of the conversation list.
     * - `'default'` – shows avatar, title, preview, timestamp, and unread badge.
     * - `'compact'` – shows only an unread indicator, the title, and an actions slot.
     * @default 'default'
     */
    variant?: ConversationListVariant | undefined;
  }
}
