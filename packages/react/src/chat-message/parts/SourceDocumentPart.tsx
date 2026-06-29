'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type {
  ChatPartRenderer,
  ChatPartRendererProps,
} from '../../chat/renderers/chatPartRenderer';
import type { ChatRole } from '../../chat/types/chat-entities';
import type { ChatSourceDocumentMessagePart } from '../../chat/types/chat-message-parts';

const stateAttributesMapping = {
  messageId: () => null,
  role: () => null,
};

/**
 * Renders a cited source document (title + excerpt).
 * Used as a `ChatPartRenderer` for `'source-document'` part types.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const SourceDocumentPart = React.forwardRef(function SourceDocumentPart(
  props: SourceDocumentPart.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { render, className, style, index, message, onToolCall, part, ...elementProps } = props;

  const state: SourceDocumentPart.State = {
    messageId: message.id,
    role: message.role,
  };

  return useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: [
      elementProps,
      {
        children: (
          <React.Fragment>
            {part.title ? <div>{part.title}</div> : null}
            {part.text ? <div>{part.text}</div> : null}
          </React.Fragment>
        ),
      },
    ],
    stateAttributesMapping,
  });
});

export namespace SourceDocumentPart {
  export interface State {
    messageId: string;
    role: ChatRole;
  }

  export interface Props
    extends
      ChatPartRendererProps<ChatSourceDocumentMessagePart>,
      Omit<BaseUIComponentProps<'div', State>, 'children' | 'part'> {}
}

export type SourceDocumentPartExternalProps = Omit<
  SourceDocumentPart.Props,
  'index' | 'message' | 'onToolCall' | 'part'
>;

export function createSourceDocumentPartRenderer(
  defaultProps: SourceDocumentPartExternalProps = {},
): ChatPartRenderer<ChatSourceDocumentMessagePart> {
  return function SourceDocumentPartRendererFn(rendererProps) {
    return <SourceDocumentPart {...defaultProps} {...rendererProps} />;
  };
}
