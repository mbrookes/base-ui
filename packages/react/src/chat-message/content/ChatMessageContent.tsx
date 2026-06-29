'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useChatPartRenderer } from '../../chat/hooks/useChatPartRenderer';
import { useChatOnToolCall } from '../../chat/hooks/useChatOnToolCall';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import type {
  ChatMessagePart,
  ChatStepStartMessagePart,
} from '../../chat/types/chat-message-parts';
import type { ChatPartRenderer } from '../../chat/renderers/chatPartRenderer';
import type { ChatLocaleText } from '../../chat/locales/chatLocaleText';
import { useMessageContext, type MessageState } from '../internals/MessageContext';

function DefaultPartFallback(props: { part: ChatMessagePart }) {
  return <div data-part-type={props.part.type} />;
}

function TextPartRenderer({
  text,
  renderText,
}: {
  text: string;
  renderText: (text: string) => React.ReactNode;
}) {
  const rendered = React.useMemo(() => renderText(text), [renderText, text]);
  return <React.Fragment>{rendered}</React.Fragment>;
}

function JsonBlock(props: { value: unknown }) {
  return <pre>{JSON.stringify(props.value, null, 2)}</pre>;
}

const renderDefaultStepStartPart: ChatPartRenderer<ChatStepStartMessagePart> = () => (
  <div role="separator" />
);

const renderDefaultDataPart: ChatPartRenderer<
  Extract<ChatMessagePart, { type: `data-${string}` }>
> = ({ part }) => <JsonBlock value={part.data} />;

export interface TextPartProps {
  renderText?: ((text: string) => React.ReactNode) | undefined;
}

function MessageRenderedPart(props: {
  part: ChatMessagePart;
  index: number;
  message: NonNullable<MessageState['message']>;
  textProps?: TextPartProps | undefined;
  resolveBuiltInPartRenderer?:
    | ((
        part: ChatMessagePart,
        localeText: ChatLocaleText,
      ) => ChatPartRenderer<ChatMessagePart> | null)
    | undefined;
}) {
  const { part, index, message, textProps, resolveBuiltInPartRenderer } = props;
  const customRenderer = useChatPartRenderer(part.type as ChatMessagePart['type']);
  const localeText = useChatLocaleText();
  const onToolCall = useChatOnToolCall();

  if (customRenderer != null) {
    return <React.Fragment>{customRenderer({ part, message, index, onToolCall })}</React.Fragment>;
  }

  if (resolveBuiltInPartRenderer != null) {
    const builtInRenderer = resolveBuiltInPartRenderer(part, localeText);
    if (builtInRenderer != null) {
      return (
        <React.Fragment>{builtInRenderer({ part, message, index, onToolCall })}</React.Fragment>
      );
    }
  }

  switch (part.type) {
    case 'text':
      if (textProps?.renderText) {
        return <TextPartRenderer text={part.text} renderText={textProps.renderText} />;
      }
      return <div>{part.text}</div>;
    case 'step-start':
      return (
        <React.Fragment>
          {renderDefaultStepStartPart({ part, message, index, onToolCall })}
        </React.Fragment>
      );
    default:
      if (part.type.startsWith('data-')) {
        const dataPart = part as Extract<ChatMessagePart, { type: `data-${string}` }>;
        return (
          <React.Fragment>
            {renderDefaultDataPart({ part: dataPart, message, index, onToolCall })}
          </React.Fragment>
        );
      }
      return <DefaultPartFallback part={part} />;
  }
}

const stateAttributesMapping = {
  messageId: () => null,
  message: () => null,
  resolvedAuthor: () => null,
  showAvatar: (v: boolean) => (v ? { 'data-show-avatar': '' } : null),
  grouped: (v: boolean) => (v ? { 'data-grouped': '' } : null),
  ownMessage: (v: boolean) => (v ? { 'data-own-message': '' } : null),
};

/**
 * Renders the content of a chat message by dispatching each message part
 * to the appropriate renderer.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageContent = React.forwardRef(function ChatMessageContent(
  props: ChatMessageContent.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    render,
    className,
    style,
    children,
    textProps,
    resolveBuiltInPartRenderer,
    afterContent,
    ...elementProps
  } = props;

  const messageState = useMessageContext();
  const message = messageState.message;
  const state: ChatMessageContent.State = messageState;

  return useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: {
      ...elementProps,
      children: (
        <React.Fragment>
          {message
            ? message.parts.map((part, idx) => (
                <MessageRenderedPart
                  part={part}
                  index={idx}
                  key={`${messageState.messageId}-${idx}-${part.type}`}
                  message={message}
                  textProps={textProps}
                  resolveBuiltInPartRenderer={resolveBuiltInPartRenderer}
                />
              ))
            : null}
          {afterContent}
          {children}
        </React.Fragment>
      ),
    },
    stateAttributesMapping,
  });
});

export namespace ChatMessageContent {
  export interface State extends MessageState {}

  export interface Props extends BaseUIComponentProps<'div', State> {
    textProps?: TextPartProps | undefined;
    /** @deprecated Use `partRenderers` on `ChatProvider` instead. */
    resolveBuiltInPartRenderer?:
      | ((
          part: ChatMessagePart,
          localeText: ChatLocaleText,
        ) => ChatPartRenderer<ChatMessagePart> | null)
      | undefined;
    afterContent?: React.ReactNode;
  }
}
