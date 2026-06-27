'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type {
  ChatPartRenderer,
  ChatPartRendererProps,
} from '../../chat/renderers/chatPartRenderer';
import type { ChatReasoningMessagePart } from '../../chat/types/chat-message-parts';
import type { ChatRole } from '../../chat/types/chat-entities';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { useMessageContentTabIndex } from '../../chat-message-list/internals/MessageRovingContext';

const stateAttributesMapping = {
  messageId: () => null,
  role: () => null,
};

/**
 * Renders a collapsible reasoning block from a thinking model.
 * Used as a `ChatPartRenderer` for `'reasoning'` part types.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ReasoningPart = React.forwardRef(function ReasoningPart(
  props: ReasoningPart.Props,
  forwardedRef: React.ForwardedRef<HTMLDetailsElement>,
) {
  const { index: _index, message, onToolCall: _onToolCall, part, ...elementProps } = props;

  const localeText = useChatLocaleText();
  const isStreaming = part.state === 'streaming';
  const contentTabIndex = useMessageContentTabIndex();

  const state: ReasoningPart.State = {
    messageId: message.id,
    role: message.role,
    streaming: isStreaming,
  };

  return useRenderElement('details', props, {
    ref: forwardedRef,
    state,
    props: [
      elementProps,
      {
        open: isStreaming || undefined,
        children: (
          <React.Fragment>
            <summary tabIndex={contentTabIndex}>
              {isStreaming
                ? localeText.messageReasoningStreamingLabel
                : localeText.messageReasoningLabel}
            </summary>
            <div>{part.text}</div>
          </React.Fragment>
        ),
      },
    ],
    stateAttributesMapping,
  });
});

export namespace ReasoningPart {
  export interface State {
    messageId: string;
    role: ChatRole;
    streaming: boolean;
  }

  export interface Props
    extends
      ChatPartRendererProps<ChatReasoningMessagePart>,
      Omit<BaseUIComponentProps<'details', State>, 'children'> {}
}

export type ReasoningPartExternalProps = Omit<
  ReasoningPart.Props,
  'index' | 'message' | 'onToolCall' | 'part'
>;

export function createReasoningPartRenderer(
  defaultProps: ReasoningPartExternalProps = {},
): ChatPartRenderer<ChatReasoningMessagePart> {
  return function ReasoningPartRenderer(rendererProps) {
    return <ReasoningPart {...defaultProps} {...rendererProps} />;
  };
}
