'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import type { ChatFileMessagePart } from '../../chat/types/chat-message-parts';
import type {
  ChatPartRenderer,
  ChatPartRendererProps,
} from '../../chat/renderers/chatPartRenderer';
import type { ChatRole } from '../../chat/types/chat-entities';
import { useMessageContentTabIndex } from '../../chat-message-list/internals/MessageRovingContext';

function FileIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      height="16"
      viewBox="0 0 24 24"
      width="16"
      style={{ flexShrink: 0 }}
    >
      <path d="M6 2h8l4 4v16H6V2Zm8 1.5V7h3.5L14 3.5Z" />
    </svg>
  );
}

const stateAttributesMapping = {
  mediaType: (v: string) => ({ 'data-media-type': v }),
  messageId: () => null,
  role: () => null,
};

/**
 * Renders a file attachment as either a thumbnail (images) or a file link.
 * Used as a `ChatPartRenderer` for `'file'` part types.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const FilePart = React.forwardRef(function FilePart(
  props: FilePart.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { index, message, onToolCall, part, ...elementProps } = props;

  const isImage = part.mediaType.startsWith('image/');
  const contentTabIndex = useMessageContentTabIndex();

  const state: FilePart.State = {
    image: isImage,
    mediaType: part.mediaType,
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
          <a href={part.url} rel="noreferrer noopener" tabIndex={contentTabIndex} target="_blank">
            {isImage ? <img alt={part.filename ?? ''} src={part.url} /> : <FileIcon />}
            <span>{part.filename ?? part.url}</span>
          </a>
        ),
      },
    ],
    stateAttributesMapping,
  });
});

export namespace FilePart {
  export interface State {
    image: boolean;
    mediaType: string;
    messageId: string;
    role: ChatRole;
  }

  export interface Props
    extends
      ChatPartRendererProps<ChatFileMessagePart>,
      Omit<BaseUIComponentProps<'div', State>, 'children'> {}
}

export type FilePartExternalProps = Omit<
  FilePart.Props,
  'index' | 'message' | 'onToolCall' | 'part'
>;

export function createFilePartRenderer(
  defaultProps: FilePartExternalProps = {},
): ChatPartRenderer<ChatFileMessagePart> {
  return function FilePartRendererFn(rendererProps) {
    return <FilePart {...defaultProps} {...rendererProps} />;
  };
}
