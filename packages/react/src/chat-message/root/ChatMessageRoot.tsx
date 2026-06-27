'use client';
import * as React from 'react';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { activeElement } from '../../internals/shadowDom';
import { ownerDocument } from '@base-ui/utils/owner';
import type { BaseUIComponentProps } from '../../internals/types';
import { useRenderElement } from '../../internals/useRenderElement';
import { useMessage } from '../../chat/hooks/useMessage';
import { useMessageAuthor } from '../../chat/hooks/useMessageAuthor';
import { useChatVariant } from '../../chat/variant/ChatVariantContext';
import { useChatDensity } from '../../chat/density/ChatDensityContext';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { MessageContextProvider, type MessageState } from '../internals/MessageContext';
import {
  focusFirstFocusableDescendant,
  useMessageRovingContext,
  useMessageRovingItem,
} from '../../chat-message-list/internals/MessageRovingContext';
import { useMessageGroupContext } from '../../chat-message-group/internals/MessageGroupContext';

const stateAttributesMapping = {
  messageId: () => null,
  message: () => null,
  resolvedAuthor: () => null,
  showAvatar: (v: boolean) => (v ? { 'data-show-avatar': '' } : null),
  grouped: (v: boolean) => (v ? { 'data-grouped': '' } : null),
  ownMessage: (v: boolean) => (v ? { 'data-own-message': '' } : null),
};

/**
 * The root element for a single chat message.
 * Renders a `<div>` element with `role="article"`.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageRoot = React.forwardRef(function ChatMessageRoot(
  props: ChatMessageRoot.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    children,
    messageId,
    grouped: groupedProp = false,
    groupAuthorName: _groupAuthorName,
    ...elementProps
  } = props;

  const groupCtx = useMessageGroupContext();
  const message = useMessage(messageId);
  const resolvedAuthor = useMessageAuthor(messageId);
  const variant = useChatVariant();
  const density = useChatDensity();
  const localeText = useChatLocaleText();

  const grouped = groupCtx != null ? groupCtx.grouped : groupedProp;

  const state: ChatMessageRoot.State = {
    messageId,
    message: message ?? null,
    role: message?.role,
    status: message?.status,
    streaming: message?.status === 'streaming',
    error: message?.status === 'error',
    grouped,
    variant,
    density,
    resolvedAuthor: resolvedAuthor ?? null,
    showAvatar: resolvedAuthor?.avatarUrl != null,
    ownMessage: resolvedAuthor?.isOwnMessage ?? message?.role === 'user',
  };

  const roving = useMessageRovingContext();
  const rovingItem = useMessageRovingItem(messageId);
  const localRootRef = React.useRef<HTMLElement | null>(null);

  const registerRovingRef = React.useCallback(
    (element: HTMLElement | null) => {
      localRootRef.current = element;
      roving?.registerItemRef(messageId, element);
    },
    [messageId, roving],
  );

  const handleRef = useMergedRefs(forwardedRef, registerRovingRef as React.Ref<HTMLDivElement>);

  useIsoLayoutEffect(() => {
    if (!rovingItem.actionable) return;
    const article = localRootRef.current;
    if (article == null) return;
    const doc = ownerDocument(article);
    const active = activeElement(doc);
    if (active != null && article.contains(active) && active !== article) return;
    focusFirstFocusableDescendant(article);
  }, [rovingItem.actionable]);

  const element = useRenderElement('div', props, {
    ref: handleRef,
    state,
    props: {
      ...elementProps,
      role: 'article',
      'aria-label': resolvedAuthor?.displayName
        ? `Message from ${resolvedAuthor.displayName}`
        : localeText.messageLabel,
      'aria-busy': state.streaming || undefined,
      ...(rovingItem.enabled && {
        tabIndex: rovingItem.focused ? 0 : -1,
        'data-actionable': rovingItem.actionable ? '' : undefined,
      }),
      onFocus: roving ? () => roving.onItemFocus(messageId) : undefined,
      onKeyDown: roving
        ? (event: React.KeyboardEvent<HTMLDivElement>) => roving.onItemKeyDown(event, messageId)
        : undefined,
      onBlur: roving
        ? (event: React.FocusEvent<HTMLDivElement>) => roving.onItemBlur(event, messageId)
        : undefined,
      children,
    },
    stateAttributesMapping,
  });

  return <MessageContextProvider value={state}>{element}</MessageContextProvider>;
});

export namespace ChatMessageRoot {
  export interface State extends MessageState {}

  export interface Props extends BaseUIComponentProps<'div', State> {
    messageId: string;
    grouped?: boolean;
    /** @ignore Internal channel from MessageGroup to the message component. */
    groupAuthorName?: React.ReactNode;
  }
}
