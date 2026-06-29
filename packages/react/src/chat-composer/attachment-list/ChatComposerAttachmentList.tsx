'use client';
import * as React from 'react';
import { useStore } from '@base-ui/utils/store';
import { useRenderElement } from '../../internals/useRenderElement';
import type { BaseUIComponentProps } from '../../internals/types';
import { useChatStore } from '../../chat/hooks/useChatStore';
import { chatSelectors } from '../../chat/selectors';
import { useComposerContext } from '../internals/ComposerContext';

const stateAttributesMapping = {
  hasValue: (v: boolean) => (v ? { 'data-has-value': '' } : null),
  attachmentCount: (v: number) => (v > 0 ? { 'data-attachment-count': String(v) } : null),
};

/**
 * Renders the list of pending file attachments.
 * Returns `null` when there are no attachments.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Chat](https://base-ui.com/react/components/chat)
 */
export const ChatComposerAttachmentList = React.forwardRef(function ChatComposerAttachmentList(
  props: ChatComposerAttachmentList.Props,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const { render, className, style, ...elementProps } = props;
  const composer = useComposerContext();
  const store = useChatStore();
  const attachments = useStore(store, chatSelectors.composerAttachments);

  const state: ChatComposerAttachmentList.State = {
    submitting: composer.submitting,
    hasValue: composer.hasValue,
    streaming: composer.streaming,
    attachmentCount: attachments.length,
    disabled: composer.disabled,
  };

  const element = useRenderElement('div', props, {
    ref: forwardedRef,
    state,
    props: elementProps,
    stateAttributesMapping,
  });

  if (attachments.length === 0) {
    return null;
  }

  return element;
});

export namespace ChatComposerAttachmentList {
  export interface State {
    submitting: boolean;
    hasValue: boolean;
    streaming: boolean;
    attachmentCount: number;
    disabled: boolean;
  }

  export interface Props extends BaseUIComponentProps<'div', State> {}
}
