'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useMessageGroupContext, type MessageGroupState } from '../internals/MessageGroupContext';

/**
 * Displays the author name for the first message in a group.
 * Renders nothing when the message is not the first in its group.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageGroupAuthorName = React.forwardRef(function ChatMessageGroupAuthorName(
  props: ChatMessageGroupAuthorName.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { children, ...elementProps } = props;
  const groupCtx = useMessageGroupContext();

  const state: ChatMessageGroupAuthorName.State = {
    first: groupCtx?.first ?? true,
    firstInList: groupCtx?.firstInList ?? true,
    last: groupCtx?.last ?? true,
    authorRole: groupCtx?.authorRole,
    authorId: groupCtx?.authorId,
    ownMessage: groupCtx?.ownMessage ?? false,
    variant: groupCtx?.variant ?? 'default',
    density: groupCtx?.density ?? 'default',
  };

  const label = children ?? groupCtx?.displayName ?? null;

  const element = useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: [elementProps, { children: label }],
  });

  if (groupCtx && !groupCtx.first) {
    return null;
  }

  if (!label) {
    return null;
  }

  return element;
});

export namespace ChatMessageGroupAuthorName {
  export interface State extends MessageGroupState {}
  export interface Props extends BaseUIComponentProps<'div', State> {}
}
