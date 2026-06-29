'use client';
import * as React from 'react';
import { useIsoLayoutEffect } from '@base-ui/utils/useIsoLayoutEffect';
import { ownerDocument } from '@base-ui/utils/owner';
import { activeElement } from '../../internals/shadowDom';
import { useOptionalMessageContext } from '../../chat-message/internals/MessageContext';
import type { UseRovingFocusReturn } from '../../chat/internals/useRovingFocus';

export interface MessageRovingState {
  focusedId: string | undefined;
  actionableId: string | undefined;
}

export interface MessageRovingContextValue {
  subscribe(listener: () => void): () => void;
  getState(): MessageRovingState;
  registerItemRef(id: string, element: HTMLElement | null): void;
  onItemFocus(id: string): void;
  onItemKeyDown(event: React.KeyboardEvent<HTMLElement>, id: string): void;
  onItemBlur(event: React.FocusEvent<HTMLElement>, id: string): void;
}

const MessageRovingContext = React.createContext<MessageRovingContextValue | null>(null);

export const MessageRovingProvider = MessageRovingContext.Provider;

export function useMessageRovingContext(): MessageRovingContextValue | null {
  return React.useContext(MessageRovingContext);
}

const noopSubscribe = () => () => {};

export function useMessageRovingItem(messageId: string): {
  enabled: boolean;
  focused: boolean;
  actionable: boolean;
} {
  const context = React.useContext(MessageRovingContext);
  const focused = React.useSyncExternalStore(
    context?.subscribe ?? noopSubscribe,
    () => (context == null ? false : context.getState().focusedId === messageId),
    () => (context == null ? false : context.getState().focusedId === messageId),
  );
  const actionable = React.useSyncExternalStore(
    context?.subscribe ?? noopSubscribe,
    () => (context == null ? false : context.getState().actionableId === messageId),
    () => false,
  );

  return { enabled: context != null, focused, actionable };
}

export function useMessageActionable(): boolean {
  const context = React.useContext(MessageRovingContext);
  const messageCtx = useOptionalMessageContext();
  const messageId = messageCtx?.messageId;
  const actionable = React.useSyncExternalStore(
    context?.subscribe ?? noopSubscribe,
    () => (context == null ? true : context.getState().actionableId === messageId),
    () => context == null,
  );

  return actionable;
}

export function useMessageContentTabIndex(): number | undefined {
  return useMessageActionable() ? undefined : -1;
}

const FOCUSABLE_CANDIDATE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'summary',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]',
].join(',');

export function hasFocusableContent(article: HTMLElement): boolean {
  return article.querySelector(FOCUSABLE_CANDIDATE_SELECTOR) != null;
}

export function focusFirstFocusableDescendant(article: HTMLElement): boolean {
  const candidates = article.querySelectorAll<HTMLElement>(FOCUSABLE_CANDIDATE_SELECTOR);

  for (let i = 0; i < candidates.length; i += 1) {
    const candidate = candidates[i];
    candidate.focus();
    if (activeElement(ownerDocument(candidate)) === candidate) {
      return true;
    }
  }

  return false;
}

export interface UseMessageRovingControllerParameters {
  enabled: boolean;
  roving: UseRovingFocusReturn;
}

export function useMessageRovingController(
  params: UseMessageRovingControllerParameters,
): MessageRovingContextValue | null {
  const { enabled, roving } = params;

  const rovingRef = React.useRef(roving);
  rovingRef.current = roving;

  const stateRef = React.useRef<MessageRovingState | null>(null);
  if (stateRef.current == null) {
    stateRef.current = { focusedId: roving.effectiveFocusedId, actionableId: undefined };
  }
  const listenersRef = React.useRef(new Set<() => void>());

  const contextValue = React.useMemo<MessageRovingContextValue>(() => {
    const notify = () => {
      listenersRef.current.forEach((listener) => listener());
    };

    const setState = (partial: Partial<MessageRovingState>) => {
      const current = stateRef.current!;
      const next = { ...current, ...partial };
      if (next.focusedId === current.focusedId && next.actionableId === current.actionableId) {
        return;
      }
      stateRef.current = next;
      notify();
    };

    return {
      subscribe: (listener: () => void) => {
        listenersRef.current.add(listener);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
      getState: () => stateRef.current!,
      registerItemRef: (id: string, element: HTMLElement | null) => {
        if (element == null && stateRef.current!.actionableId === id) {
          setState({ actionableId: undefined });
        }
        rovingRef.current.registerItemRef(id, element);
      },
      onItemFocus: (id: string) => {
        rovingRef.current.setFocusedId(id);
      },
      onItemKeyDown: (event: React.KeyboardEvent<HTMLElement>, id: string) => {
        if (event.target !== event.currentTarget) {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setState({ actionableId: undefined });
            rovingRef.current.focusItem(id);
          }
          return;
        }

        if (event.key === 'Enter') {
          const article = event.currentTarget as HTMLElement;
          if (hasFocusableContent(article)) {
            event.preventDefault();
            if (stateRef.current!.actionableId === id) {
              focusFirstFocusableDescendant(article);
            } else {
              setState({ actionableId: id });
            }
          }
          return;
        }

        rovingRef.current.handleKeyDown(event, id);
      },
      onItemBlur: (event: React.FocusEvent<HTMLElement>, id: string) => {
        if (stateRef.current!.actionableId !== id) {
          return;
        }

        const nextTarget = event.relatedTarget as Node | null;
        const article = event.currentTarget as HTMLElement;
        if (nextTarget == null || !article.contains(nextTarget)) {
          setState({ actionableId: undefined });
        }
      },
    };
  }, []);

  useIsoLayoutEffect(() => {
    const current = stateRef.current!;
    if (current.focusedId !== roving.effectiveFocusedId) {
      stateRef.current = { ...current, focusedId: roving.effectiveFocusedId };
      listenersRef.current.forEach((listener) => listener());
    }
  }, [roving.effectiveFocusedId]);

  return enabled ? contextValue : null;
}
