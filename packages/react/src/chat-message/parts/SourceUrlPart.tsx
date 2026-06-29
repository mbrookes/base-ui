'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type {
  ChatPartRenderer,
  ChatPartRendererProps,
} from '../../chat/renderers/chatPartRenderer';
import type { ChatRole } from '../../chat/types/chat-entities';
import type { ChatSourceUrlMessagePart } from '../../chat/types/chat-message-parts';
import { useMessageContentTabIndex } from '../../chat-message-list/internals/MessageRovingContext';

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      height="1em"
      viewBox="0 0 24 24"
      width="1em"
    >
      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3Z" />
      <path d="M5 5h6v2H7v10h10v-4h2v6H5V5Z" />
    </svg>
  );
}

const stateAttributesMapping = {
  messageId: () => null,
  role: () => null,
};

/**
 * Renders a cited source URL as an external link.
 * Used as a `ChatPartRenderer` for `'source-url'` part types.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const SourceUrlPart = React.forwardRef(function SourceUrlPart(
  props: SourceUrlPart.Props,
  forwardedRef: React.ForwardedRef<HTMLSpanElement>,
) {
  const { index, message, onToolCall, part, ...elementProps } = props;

  const contentTabIndex = useMessageContentTabIndex();

  const state: SourceUrlPart.State = {
    messageId: message.id,
    role: message.role,
  };

  return useRenderElement('span', props, {
    ref: forwardedRef,
    state,
    props: [
      elementProps,
      {
        children: (
          <React.Fragment>
            <span>
              <ExternalLinkIcon />
            </span>
            <a href={part.url} rel="noreferrer noopener" tabIndex={contentTabIndex} target="_blank">
              {part.title ?? part.url}
            </a>
          </React.Fragment>
        ),
      },
    ],
    stateAttributesMapping,
  });
});

export namespace SourceUrlPart {
  export interface State {
    messageId: string;
    role: ChatRole;
  }

  export interface Props
    extends
      ChatPartRendererProps<ChatSourceUrlMessagePart>,
      Omit<BaseUIComponentProps<'span', State>, 'children'> {}
}

export type SourceUrlPartExternalProps = Omit<
  SourceUrlPart.Props,
  'index' | 'message' | 'onToolCall' | 'part'
>;

export function createSourceUrlPartRenderer(
  defaultProps: SourceUrlPartExternalProps = {},
): ChatPartRenderer<ChatSourceUrlMessagePart> {
  return function SourceUrlPartRendererFn(rendererProps) {
    return <SourceUrlPart {...defaultProps} {...rendererProps} />;
  };
}
