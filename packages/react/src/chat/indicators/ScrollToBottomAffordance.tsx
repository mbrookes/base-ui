'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import { BaseUIComponentProps } from '../../internals/types';
import { mergeProps } from '../../merge-props';
import { useChatLocaleText } from '../locales/ChatLocaleContext';
import { useMessageListContext } from '../../chat-message-list/internals/MessageListContext';

export interface ScrollToBottomAffordanceState {
  atBottom: boolean;
  unseenMessageCount: number;
  label: string;
}

const stateAttributesMapping = {
  atBottom: (v: boolean) => (v ? { 'data-at-bottom': '' } : null),
  unseenMessageCount: (v: number) => (v > 0 ? { 'data-unseen-message-count': String(v) } : null),
  label: () => null,
};

/**
 * A button that scrolls the message list to the bottom.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ScrollToBottomAffordance = React.forwardRef(function ScrollToBottomAffordance(
  props: ScrollToBottomAffordance.Props,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const { scrollBehavior, children, ...elementProps } = props;
  const { isAtBottom, scrollToBottom, unseenMessageCount } = useMessageListContext();
  const localeText = useChatLocaleText();

  const label = React.useMemo(
    () =>
      unseenMessageCount > 0
        ? localeText.scrollToBottomWithCountLabel(unseenMessageCount)
        : localeText.scrollToBottomLabel,
    [localeText, unseenMessageCount],
  );

  const state: ScrollToBottomAffordance.State = {
    atBottom: isAtBottom,
    unseenMessageCount,
    label,
  };

  const element = useRenderElement('button', props, {
    state,
    ref: forwardedRef,
    props: mergeProps(
      {
        ...elementProps,
        type: 'button',
        'aria-label': label,
        onClick: () => scrollToBottom({ behavior: scrollBehavior }),
        children: children ?? (
          <React.Fragment>
            <span>{localeText.scrollToBottomLabel}</span>
            {unseenMessageCount > 0 && <span>{unseenMessageCount}</span>}
          </React.Fragment>
        ),
      },
      {},
    ),
    stateAttributesMapping,
  });

  if (isAtBottom) {
    return null;
  }

  return element;
});

export namespace ScrollToBottomAffordance {
  export interface State {
    atBottom: boolean;
    unseenMessageCount: number;
    label: string;
  }

  export interface Props extends Omit<BaseUIComponentProps<'button', State>, 'children'> {
    scrollBehavior?: ScrollBehavior | undefined;
    children?: React.ReactNode;
  }
}
