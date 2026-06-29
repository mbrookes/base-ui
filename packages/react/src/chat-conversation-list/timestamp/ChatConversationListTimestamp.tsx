'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { useConversationListItemContext } from '../internals/ConversationListItemContext';
import type { ConversationListItemState } from '../internals/ConversationListItemContext';

/**
 * Displays the conversation's last message timestamp.
 * Renders nothing if there is no timestamp available.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatConversationListTimestamp = React.forwardRef(
  function ChatConversationListTimestamp(
    props: ChatConversationListTimestamp.Props,
    forwardedRef: React.ForwardedRef<HTMLDivElement>,
  ) {
    const { children, ...elementProps } = props;
    const state: ChatConversationListTimestamp.State = useConversationListItemContext();
    const localeText = useChatLocaleText();
    const lastMessageAt = state.conversation?.lastMessageAt;

    const element = useRenderElement('div', props, {
      ref: forwardedRef,
      state,
      props: [
        elementProps,
        {
          children:
            children ??
            (lastMessageAt ? (
              // suppressHydrationWarning: locale-sensitive formatting can differ between server and client.
              <time
                dateTime={lastMessageAt}
                aria-label={localeText.conversationTimestampAriaLabel(lastMessageAt)}
                suppressHydrationWarning
              >
                {localeText.conversationTimestampLabel(lastMessageAt)}
              </time>
            ) : null),
        },
      ],
    });

    if (!lastMessageAt && !children) {
      return null;
    }

    return element;
  },
);

export namespace ChatConversationListTimestamp {
  export interface State extends ConversationListItemState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
