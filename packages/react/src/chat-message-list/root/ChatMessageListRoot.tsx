'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useChat } from '../../chat/hooks/useChat';
import { useChatStore } from '../../chat/hooks/useChatStore';
import { useMessageIds } from '../../chat/hooks/useMessage';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { useRovingFocus } from '../../chat/internals/useRovingFocus';
import { useMessageListBehavior } from '../behavior/useMessageListBehavior';
import { MessageListContextProvider } from '../internals/MessageListContext';
import {
  MessageRovingProvider,
  useMessageRovingController,
} from '../internals/MessageRovingContext';
import { MessageListInternalContextProvider } from '../internals/MessageListInternalContext';

const DEFAULT_ESTIMATED_ITEM_SIZE = 84;
const DEFAULT_AUTO_SCROLL_BUFFER = 150;

export interface MessageListRootHandle {
  scrollToBottom(options?: { behavior?: ScrollBehavior | undefined }): void;
  /**
   * Move the roving focus to the given message (defaults to the newest one)
   * and focus its article element.
   */
  focusMessage(id?: string): void;
}

export interface MessageListRootAutoScrollConfig {
  /**
   * Distance in pixels from the bottom of the scroll container within which the
   * user is still considered "at the bottom" and auto-scroll will trigger.
   * @default 150
   */
  buffer?: number | undefined;
}

/**
 * The root component of the chat message list. Manages scroll behavior,
 * auto-scrolling, roving focus, and provides context to child parts.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageListRoot = React.forwardRef(function ChatMessageListRoot(
  props: ChatMessageListRoot.Props,
  ref: React.ForwardedRef<MessageListRootHandle>,
) {
  const {
    items: itemsProp,
    renderItem,
    getItemKey = (id: string) => id,
    estimatedItemSize = DEFAULT_ESTIMATED_ITEM_SIZE,
    onReachTop,
    onReachBottom,
    autoScroll = true,
    enableRovingFocus = true,
    children,
    ...elementProps
  } = props;

  const defaultItems = useMessageIds();
  const { hasMoreHistory, loadMoreHistory, messages, isStreaming: isAdapterStreaming } = useChat();
  const store = useChatStore();
  const localeText = useChatLocaleText();
  const itemIds = itemsProp ?? defaultItems;

  const roving = useRovingFocus({
    itemIds,
    restoreKey: store,
    scope: 'message-list',
    fallback: 'last',
    enablePageKeys: false,
    restoreFocusOnMount: false,
  });
  const rovingContextValue = useMessageRovingController({
    enabled: enableRovingFocus,
    roving,
  });

  const isAnyMessageStreaming = messages.some((m) => m.status === 'streaming');
  const isStreaming = isAdapterStreaming || isAnyMessageStreaming;

  const [statusAnnouncement, setStatusAnnouncement] = React.useState('');
  const prevIsStreamingRef = React.useRef(isStreaming);
  React.useEffect(() => {
    if (prevIsStreamingRef.current === isStreaming) {
      return;
    }
    prevIsStreamingRef.current = isStreaming;
    setStatusAnnouncement(
      isStreaming
        ? localeText.responseStreamingStartedAnnouncement
        : localeText.responseStreamingCompletedAnnouncement,
    );
  }, [isStreaming, localeText]);

  const autoScrollEnabled = autoScroll !== false;
  let autoScrollBuffer: number;
  if (!autoScrollEnabled) {
    autoScrollBuffer = estimatedItemSize;
  } else if (typeof autoScroll === 'object') {
    autoScrollBuffer = autoScroll.buffer ?? DEFAULT_AUTO_SCROLL_BUFFER;
  } else {
    autoScrollBuffer = DEFAULT_AUTO_SCROLL_BUFFER;
  }

  const behavior = useMessageListBehavior({
    itemIds,
    estimatedItemSize,
    onReachTop,
    onReachBottom,
    messages,
    hasMoreHistory,
    loadMoreHistory,
    autoScrollEnabled,
    autoScrollBuffer,
    isStreaming,
  });

  const { setFocusedId, focusItem } = roving;
  React.useImperativeHandle(
    ref,
    () => ({
      scrollToBottom: behavior.scrollToBottom,
      focusMessage: (id?: string) => {
        const targetId = id ?? itemIds[itemIds.length - 1];
        if (targetId == null) {
          return;
        }
        setFocusedId(targetId);
        focusItem(targetId);
      },
    }),
    [behavior.scrollToBottom, focusItem, itemIds, setFocusedId],
  );

  const state: ChatMessageListRoot.State = {
    messageCount: itemIds.length,
    atBottom: behavior.ownerState.isAtBottom,
  };

  const internalContextValue = React.useMemo(
    () => ({
      setRootElement: behavior.setRootElement,
      handleScroll: behavior.handleScroll,
      scheduleResizeRestore: behavior.scheduleResizeRestore,
      registerRowElement: behavior.registerRowElement,
      itemIds,
      renderItem,
      getItemKey,
      statusAnnouncement,
      messageListLabel: localeText.messageListLabel,
    }),
    [
      behavior.setRootElement,
      behavior.handleScroll,
      behavior.scheduleResizeRestore,
      behavior.registerRowElement,
      itemIds,
      renderItem,
      getItemKey,
      statusAnnouncement,
      localeText.messageListLabel,
    ],
  );

  return (
    <MessageListContextProvider value={behavior.contextValue}>
      <MessageRovingProvider value={rovingContextValue}>
        <MessageListInternalContextProvider value={internalContextValue}>
          {useRenderElement('div', props, {
            ref: undefined,
            state,
            props: [
              elementProps,
              {
                children,
                style: { position: 'relative', minHeight: 0, ...elementProps.style },
              },
            ],
          })}
        </MessageListInternalContextProvider>
      </MessageRovingProvider>
    </MessageListContextProvider>
  );
});

export namespace ChatMessageListRoot {
  export interface State {
    messageCount: number;
    atBottom: boolean;
  }

  export interface Props extends BaseUIComponentProps<'div', State> {
    /**
     * Override the list of message IDs to render. Defaults to the IDs from the chat store.
     */
    items?: string[] | undefined;
    /**
     * Renders each message row. Required.
     */
    renderItem(params: { id: string; index: number }): React.ReactNode;
    getItemKey?: ((id: string, index: number) => React.Key) | undefined;
    estimatedItemSize?: number | undefined;
    onReachTop?: (() => void) | undefined;
    onReachBottom?: (() => void) | undefined;
    /**
     * Controls automatic scrolling to the bottom when new messages arrive.
     * - `true` – enable with the default buffer (150 px).
     * - `{ buffer: number }` – enable with a custom threshold.
     * - `false` – disable.
     * @default true
     */
    autoScroll?: boolean | MessageListRootAutoScrollConfig | undefined;
    /**
     * Whether the message list manages a roving tabindex over its messages.
     * @default true
     */
    enableRovingFocus?: boolean | undefined;
  }
}
