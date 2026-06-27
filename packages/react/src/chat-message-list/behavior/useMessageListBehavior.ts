'use client';
import * as React from 'react';
import { useAnimationFrame } from '@base-ui/utils/useAnimationFrame';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import type { ChatMessage } from '../../chat/types/chat-entities';
import type { MessageListContextValue } from '../internals/MessageListContext';

type ScrollAnchor = {
  id: string;
  offsetFromBottom: number;
};

type ChangeKind = 'none' | 'append' | 'prepend' | 'other';

function arraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }
  return left.every((value, index) => value === right[index]);
}

function startsWithSequence(values: string[], prefix: string[]) {
  if (prefix.length > values.length) {
    return false;
  }
  return prefix.every((value, index) => values[index] === value);
}

function endsWithSequence(values: string[], suffix: string[]) {
  if (suffix.length > values.length) {
    return false;
  }
  const offset = values.length - suffix.length;
  return suffix.every((value, index) => values[offset + index] === value);
}

function classifyItemChange(previous: string[], next: string[]): ChangeKind {
  if (arraysEqual(previous, next)) {
    return 'none';
  }
  if (next.length > previous.length && startsWithSequence(next, previous)) {
    return 'append';
  }
  if (next.length > previous.length && endsWithSequence(next, previous)) {
    return 'prepend';
  }
  return 'other';
}

function isScrollableToBottom(root: HTMLElement | null, threshold: number) {
  if (!root) {
    return true;
  }
  return root.scrollHeight - root.clientHeight - root.scrollTop <= threshold;
}

export interface MessageListBehaviorResult {
  contextValue: MessageListContextValue;
  handleScroll(): void;
  ownerState: {
    messageCount: number;
    isAtBottom: boolean;
  };
  registerRowElement(id: string, element: HTMLDivElement | null): void;
  scheduleResizeRestore(): void;
  scrollToBottom(options?: { behavior?: ScrollBehavior }): void;
  setRootElement(node: HTMLDivElement | null): void;
}

export function useMessageListBehavior(parameters: {
  itemIds: string[];
  estimatedItemSize: number;
  onReachTop?: () => void;
  onReachBottom?: () => void;
  messages: ChatMessage[];
  hasMoreHistory: boolean;
  loadMoreHistory(): Promise<void>;
  autoScrollEnabled: boolean;
  autoScrollBuffer: number;
  isStreaming: boolean;
}): MessageListBehaviorResult {
  const {
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
  } = parameters;

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const rowElementsRef = React.useRef(new Map<string, HTMLDivElement | null>());
  const previousItemIdsRef = React.useRef<string[]>(itemIds);
  const itemIdsRef = React.useRef(itemIds);
  itemIdsRef.current = itemIds;
  const anchorRef = React.useRef<ScrollAnchor | null>(null);
  const topReachedRef = React.useRef(false);
  const topLoadInFlightRef = React.useRef(false);
  const isMountedRef = React.useRef(true);
  const isStreamingRef = React.useRef(isStreaming);
  isStreamingRef.current = isStreaming;
  const [isAtBottom, setIsAtBottom] = React.useState(true);
  const [unseenMessageCount, setUnseenMessageCount] = React.useState(0);
  const isAtBottomRef = React.useRef(true);
  const unseenMessageCountRef = React.useRef(0);
  const resizeFrame = useAnimationFrame();

  const setRootElement = React.useCallback((node: HTMLDivElement | null) => {
    rootRef.current = node;
  }, []);

  const messageById = React.useMemo(() => {
    const nextMap = new Map<string, ChatMessage>();
    messages.forEach((message) => {
      nextMap.set(message.id, message);
    });
    return nextMap;
  }, [messages]);

  const onReachBottomRef = React.useRef(onReachBottom);
  onReachBottomRef.current = onReachBottom;

  const updateIsAtBottom = React.useCallback(
    (options?: { silent?: boolean }) => {
      const nextIsAtBottom = isScrollableToBottom(rootRef.current, autoScrollBuffer);
      const previousIsAtBottom = isAtBottomRef.current;

      isAtBottomRef.current = nextIsAtBottom;
      setIsAtBottom((previous) => (previous === nextIsAtBottom ? previous : nextIsAtBottom));

      if (!options?.silent && !previousIsAtBottom && nextIsAtBottom) {
        onReachBottomRef.current?.();
      }

      return nextIsAtBottom;
    },
    [autoScrollBuffer],
  );

  const updateUnseenMessageCount = React.useCallback((nextCount: number) => {
    unseenMessageCountRef.current = nextCount;
    setUnseenMessageCount((previous) => (previous === nextCount ? previous : nextCount));
  }, []);

  const captureAnchor = React.useCallback((ids: string[]): ScrollAnchor | null => {
    const root = rootRef.current;
    if (!root) {
      return null;
    }
    const containerRect = root.getBoundingClientRect();
    for (const id of ids) {
      const element = rowElementsRef.current.get(id);
      if (!element) {
        continue;
      }
      const rect = element.getBoundingClientRect();
      if (rect.bottom <= containerRect.top || rect.top >= containerRect.bottom) {
        continue;
      }
      return {
        id,
        offsetFromBottom: containerRect.bottom - rect.bottom,
      };
    }
    return null;
  }, []);

  const restoreAnchor = React.useCallback((anchor: ScrollAnchor | null) => {
    const root = rootRef.current;
    if (!root || !anchor) {
      return false;
    }
    const element = rowElementsRef.current.get(anchor.id);
    if (!element) {
      return false;
    }
    const containerBottom = root.getBoundingClientRect().bottom;
    const nextOffsetFromBottom = containerBottom - element.getBoundingClientRect().bottom;
    root.scrollTop += anchor.offsetFromBottom - nextOffsetFromBottom;
    return true;
  }, []);

  const scrollToBottom = React.useCallback(
    (options?: { behavior?: ScrollBehavior }) => {
      const root = rootRef.current;
      if (!root) {
        return;
      }
      if (typeof root.scrollTo === 'function') {
        root.scrollTo({
          top: root.scrollHeight,
          behavior: options?.behavior ?? 'auto',
        });
      } else {
        root.scrollTop = root.scrollHeight;
      }
      updateIsAtBottom();
      updateUnseenMessageCount(0);
      anchorRef.current = captureAnchor(itemIdsRef.current);
    },
    [captureAnchor, updateIsAtBottom, updateUnseenMessageCount],
  );

  const registerRowElement = React.useCallback((id: string, element: HTMLDivElement | null) => {
    if (element == null) {
      rowElementsRef.current.delete(id);
      return;
    }
    rowElementsRef.current.set(id, element);
  }, []);

  const scheduleResizeRestore = React.useCallback(() => {
    resizeFrame.request(() => {
      if (!isMountedRef.current) {
        return;
      }
      if (isAtBottomRef.current && autoScrollEnabled && isStreamingRef.current) {
        scrollToBottom();
      } else {
        if (!isAtBottomRef.current) {
          restoreAnchor(anchorRef.current);
        }
        updateIsAtBottom();
        anchorRef.current = captureAnchor(itemIdsRef.current);
      }
    });
  }, [
    autoScrollEnabled,
    captureAnchor,
    resizeFrame,
    restoreAnchor,
    scrollToBottom,
    updateIsAtBottom,
  ]);

  const maybeLoadMoreHistory = React.useCallback(async () => {
    const root = rootRef.current;
    if (!root || !hasMoreHistory || topLoadInFlightRef.current) {
      return;
    }
    if (root.scrollTop > estimatedItemSize) {
      topReachedRef.current = false;
      return;
    }
    if (topReachedRef.current) {
      return;
    }
    topReachedRef.current = true;
    topLoadInFlightRef.current = true;
    onReachTop?.();
    try {
      await loadMoreHistory();
    } finally {
      topLoadInFlightRef.current = false;
    }
  }, [estimatedItemSize, hasMoreHistory, loadMoreHistory, onReachTop]);

  const handleScroll = React.useCallback(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    anchorRef.current = captureAnchor(itemIdsRef.current);
    const nextIsAtBottom = updateIsAtBottom();
    if (nextIsAtBottom) {
      updateUnseenMessageCount(0);
    }
    if (root.scrollTop > estimatedItemSize) {
      topReachedRef.current = false;
      return;
    }
    void maybeLoadMoreHistory();
  }, [
    captureAnchor,
    estimatedItemSize,
    maybeLoadMoreHistory,
    updateIsAtBottom,
    updateUnseenMessageCount,
  ]);

  useIsoLayoutEffect(() => {
    updateIsAtBottom();
    anchorRef.current = captureAnchor(itemIdsRef.current);
  }, [captureAnchor, updateIsAtBottom]);

  useIsoLayoutEffect(() => {
    const previousItemIds = previousItemIdsRef.current;
    const changeKind = classifyItemChange(previousItemIds, itemIds);

    if (changeKind === 'prepend' || changeKind === 'other') {
      restoreAnchor(anchorRef.current);
    } else if (changeKind === 'append') {
      const appendedIds = itemIds.slice(previousItemIds.length);
      const lastAppendedMessage = appendedIds.length
        ? messageById.get(appendedIds[appendedIds.length - 1])
        : null;

      if ((autoScrollEnabled && isAtBottomRef.current) || lastAppendedMessage?.role === 'user') {
        scrollToBottom();
      } else if (appendedIds.length > 0) {
        updateUnseenMessageCount(unseenMessageCountRef.current + appendedIds.length);
      }
    }

    const nextIsAtBottom = updateIsAtBottom({ silent: changeKind === 'other' });
    if (nextIsAtBottom) {
      updateUnseenMessageCount(0);
    }

    anchorRef.current = captureAnchor(itemIds);
    topReachedRef.current = false;
    previousItemIdsRef.current = itemIds;
  }, [
    autoScrollEnabled,
    captureAnchor,
    itemIds,
    messageById,
    restoreAnchor,
    scrollToBottom,
    updateIsAtBottom,
    updateUnseenMessageCount,
  ]);

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const contextValue = React.useMemo(
    () => ({
      isAtBottom,
      unseenMessageCount,
      scrollToBottom,
    }),
    [isAtBottom, scrollToBottom, unseenMessageCount],
  );

  return {
    contextValue,
    handleScroll,
    ownerState: {
      messageCount: itemIds.length,
      isAtBottom,
    },
    registerRowElement,
    scheduleResizeRestore,
    scrollToBottom,
    setRootElement,
  };
}
