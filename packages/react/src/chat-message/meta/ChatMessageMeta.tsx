'use client';
import * as React from 'react';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { Progress } from '@base-ui/react/progress';
import { useIsHydrated } from '../../chat/internals/useIsHydrated';
import { useChatLocaleText } from '../../chat/locales/ChatLocaleContext';
import { useMessageContext, type MessageState } from '../internals/MessageContext';

const stateAttributesMapping = {
  messageId: () => null,
  message: () => null,
  resolvedAuthor: () => null,
  showAvatar: (v: boolean) => (v ? { 'data-show-avatar': '' } : null),
  grouped: (v: boolean) => (v ? { 'data-grouped': '' } : null),
  ownMessage: (v: boolean) => (v ? { 'data-own-message': '' } : null),
};

/**
 * Renders metadata for a chat message: timestamp, status, and streaming indicator.
 * Returns `null` when there is nothing to display.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatMessageMeta = React.forwardRef(function ChatMessageMeta(
  props: ChatMessageMeta.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { render, className, style, ...elementProps } = props;
  const ctx = useMessageContext();
  const localeText = useChatLocaleText();
  const isHydrated = useIsHydrated();

  const state: ChatMessageMeta.State = ctx;

  const timestampLabel =
    isHydrated && ctx.message?.createdAt
      ? localeText.messageTimestampLabel(ctx.message.createdAt)
      : '';

  const showTimestamp = Boolean(timestampLabel);
  const messageStatus = ctx.message?.status;
  const isDeliveryStatus = messageStatus === 'sent' || messageStatus === 'read';
  const showStatus = messageStatus && !(isDeliveryStatus && ctx.message?.role !== 'user');
  const statusLabel = showStatus ? localeText.messageStatusLabel(messageStatus) : '';
  const hasMeta = showTimestamp || Boolean(statusLabel) || ctx.message?.editedAt != null;

  const element = useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: {
      ...elementProps,
      children: (
        <React.Fragment>
          {ctx.streaming && (
            <Progress.Root value={null} aria-label={localeText.messageStatusLabel('streaming')}>
              <Progress.Track>
                <Progress.Indicator />
              </Progress.Track>
            </Progress.Root>
          )}
          {statusLabel && !ctx.streaming && <span>{statusLabel}</span>}
          {ctx.message?.editedAt && <span>{localeText.messageEditedLabel}</span>}
          {showTimestamp && <span>{timestampLabel}</span>}
        </React.Fragment>
      ),
    },
    stateAttributesMapping,
  });

  if (!hasMeta && !ctx.streaming) {
    return null;
  }

  return element;
});

export namespace ChatMessageMeta {
  export interface State extends MessageState {}
  export interface Props extends Omit<BaseUIComponentProps<'div', State>, 'children'> {}
}
