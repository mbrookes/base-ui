'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useMessageIds } from '../../chat/hooks/useMessage';
import { useChatComposer } from '../../chat/hooks/useChatComposer';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { SuggestionsContextProvider } from '../internals/SuggestionsContext';
import { ChatSuggestionsItem } from '../item/ChatSuggestionsItem';

export interface ChatSuggestion {
  /** The value to pre-fill into the composer when the suggestion is clicked. */
  value: string;
  /** Display label. Falls back to `value` if omitted. */
  label?: string | undefined;
}

function normalizeSuggestion(item: ChatSuggestion | string): ChatSuggestion {
  return typeof item === 'string' ? { value: item } : item;
}

/**
 * Renders a group of suggestion buttons. Hidden when the conversation has messages
 * unless `alwaysVisible` is set.
 * Renders a `<div>` element with `role="group"`.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatSuggestionsRoot = React.forwardRef(function ChatSuggestionsRoot(
  props: ChatSuggestionsRoot.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    children,
    suggestions,
    autoSubmit = false,
    alwaysVisible = false,
    ...elementProps
  } = props;
  const messageIds = useMessageIds();
  const { setValue, submit } = useChatComposer();
  const localeText = useChatLocaleText();
  const isEmpty = messageIds.length === 0;

  const normalized = React.useMemo(
    () => (suggestions ?? []).map(normalizeSuggestion),
    [suggestions],
  );

  const suggestionCount = children ? React.Children.count(children) : normalized.length;

  const state: ChatSuggestionsRoot.State = {
    empty: isEmpty,
    suggestionCount,
  };

  const onSelect = React.useCallback(
    (value: string) => {
      setValue(value);
      if (autoSubmit) {
        void Promise.resolve().then(() => submit());
      }
    },
    [autoSubmit, setValue, submit],
  );

  const contextValue = React.useMemo(() => ({ onSelect }), [onSelect]);

  const element = useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: [
      elementProps,
      {
        role: 'group' as const,
        'aria-label': localeText.suggestionsLabel,
        children:
          children ??
          normalized.map((suggestion, index) => (
            <ChatSuggestionsItem
              key={suggestion.value}
              value={suggestion.value}
              label={suggestion.label}
              index={index}
            />
          )),
      },
    ],
  });

  if (!isEmpty && !alwaysVisible) {
    return null;
  }

  return <SuggestionsContextProvider value={contextValue}>{element}</SuggestionsContextProvider>;
});

export namespace ChatSuggestionsRoot {
  export interface State {
    empty: boolean;
    suggestionCount: number;
  }

  export interface Props extends BaseUIComponentProps<'div', State> {
    /**
     * Suggestion items. Strings are normalized to `{ value, label }`.
     * Ignored when `children` are provided.
     */
    suggestions?: Array<ChatSuggestion | string> | undefined;
    /**
     * Whether to auto-submit when a suggestion is clicked.
     * @default false
     */
    autoSubmit?: boolean | undefined;
    /**
     * When `true`, renders suggestions even if the conversation has messages.
     * @default false
     */
    alwaysVisible?: boolean | undefined;
  }
}
