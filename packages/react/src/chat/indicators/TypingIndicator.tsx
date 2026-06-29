'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import { BaseUIComponentProps } from '../../internals/types';
import { useChat } from '../hooks/useChat';
import { useChatStatus } from '../hooks/useChatStatus';
import type { ChatUser } from '../types/chat-entities';
import { useChatLocaleText } from '../locales/ChatLocaleContext';

export interface TypingIndicatorState {
  count: number;
  label: string;
}

const stateAttributesMapping = {
  count: (v: number) => (v > 0 ? { 'data-count': String(v) } : null),
  label: () => null,
};

function resolveTypingUser(
  userId: string,
  participants: ChatUser[] | undefined,
  messageAuthors: ChatUser[],
) {
  return (
    participants?.find((participant) => participant.id === userId) ??
    messageAuthors.find((author) => author.id === userId) ?? { id: userId }
  );
}

/**
 * Shows who is currently typing in the active conversation.
 * Returns `null` when no users are typing.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const TypingIndicator = React.forwardRef(function TypingIndicator(
  props: TypingIndicator.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { render, className, style, ...elementProps } = props;
  const { activeConversationId, conversations, messages } = useChat();
  const { typingUserIds } = useChatStatus();
  const localeText = useChatLocaleText();

  const conversation = React.useMemo(
    () =>
      activeConversationId == null
        ? null
        : (conversations.find((candidate) => candidate.id === activeConversationId) ?? null),
    [activeConversationId, conversations],
  );
  const messageAuthors = React.useMemo(
    () =>
      messages.reduce<ChatUser[]>((authors, message) => {
        if (message.author && !authors.some((author) => author.id === message.author!.id)) {
          authors.push(message.author);
        }
        return authors;
      }, []),
    [messages],
  );
  const users = React.useMemo(
    () =>
      typingUserIds.map((userId) =>
        resolveTypingUser(userId, conversation?.participants, messageAuthors),
      ),
    [conversation?.participants, messageAuthors, typingUserIds],
  );
  const label = React.useMemo(
    () => (users.length === 0 ? '' : localeText.typingIndicatorLabel(users)),
    [localeText, users],
  );

  const state: TypingIndicator.State = {
    count: users.length,
    label,
  };

  const element = useRenderElement('div', props, {
    state,
    ref: forwardedRef,
    props: {
      ...elementProps,
      'aria-live': 'polite' as unknown as undefined,
      children: label,
    },
    stateAttributesMapping,
  });

  if (users.length === 0) {
    return null;
  }

  return element;
});

export namespace TypingIndicator {
  export interface State {
    count: number;
    label: string;
  }

  export interface Props extends Omit<BaseUIComponentProps<'div', State>, 'children'> {}
}
