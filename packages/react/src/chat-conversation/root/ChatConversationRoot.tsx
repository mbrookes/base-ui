'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useChat } from '../../chat/hooks/useChat';
import { useConversations } from '../../chat/hooks/useConversation';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { markChatLayoutPane } from '../../chat/layout/chatLayoutPaneKind';
import type { ChatConversation } from '../../chat/types/chat-entities';
import {
  ConversationContextProvider,
  type ConversationState,
} from '../internals/ConversationContext';

function getActiveConversation(
  conversations: ChatConversation[],
  activeConversationId: string | undefined,
): ChatConversation | null {
  if (activeConversationId == null) {
    return null;
  }
  return conversations.find((c) => c.id === activeConversationId) ?? null;
}

/**
 * The root of the conversation (thread) pane.
 * Renders a `<div>` element with `role="region"`.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationRoot = markChatLayoutPane(
  React.forwardRef(function ChatConversationRoot(
    props: ChatConversationRoot.Props,
    forwardedRef: React.ForwardedRef<HTMLDivElement>,
  ) {
    const { render, className, style, children, ...elementProps } = props;
    const { activeConversationId } = useChat();
    const localeText = useChatLocaleText();
    const conversations = useConversations();

    const conversation = React.useMemo(
      () => getActiveConversation(conversations, activeConversationId),
      [activeConversationId, conversations],
    );

    const state: ChatConversationRoot.State = {
      conversationId: activeConversationId,
      hasConversation: conversation != null,
      conversation,
    };

    return (
      <ConversationContextProvider value={state}>
        {useRenderElement('div', props, {
          ref: forwardedRef,
          state,
          props: [
            elementProps,
            {
              role: 'region' as const,
              'aria-label': localeText.threadLandmarkLabel,
              children,
            },
          ],
        })}
      </ConversationContextProvider>
    );
  }),
  'thread',
);

export namespace ChatConversationRoot {
  export interface State extends ConversationState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
