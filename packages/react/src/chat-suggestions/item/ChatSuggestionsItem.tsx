'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useSuggestionsContext } from '../internals/SuggestionsContext';

/**
 * A single suggestion button that pre-fills the composer when clicked.
 * Renders a `<button>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatSuggestionsItem = React.forwardRef(function ChatSuggestionsItem(
  props: ChatSuggestionsItem.Props,
  forwardedRef: React.ForwardedRef<HTMLButtonElement>,
) {
  const { children, value, label, index = 0, onClick, ...elementProps } = props;
  const context = useSuggestionsContext();
  const displayLabel = label ?? value;

  const state: ChatSuggestionsItem.State = {
    value,
    label: displayLabel,
    index,
  };

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);
      if (event.defaultPrevented) {
        return;
      }
      context?.onSelect(value);
    },
    [context, onClick, value],
  );

  return useRenderElement('button', props, {
    ref: forwardedRef,
    state,
    props: [
      elementProps,
      {
        type: 'button' as const,
        'data-index': index,
        onClick: handleClick,
        children: children ?? displayLabel,
      },
    ],
  });
});

export namespace ChatSuggestionsItem {
  export interface State {
    value: string;
    label: string;
    index: number;
  }

  export interface Props extends Omit<BaseUIComponentProps<'button', State>, 'children'> {
    /** The value to pre-fill into the composer when clicked. */
    value: string;
    /** Display label. Falls back to `value`. */
    label?: string;
    /** The index of this item within the suggestions list. */
    index?: number;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }
}
